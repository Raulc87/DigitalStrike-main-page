#!/usr/bin/env python3
"""Check that every relative link and anchor in the repository's Markdown exists.

Used by .github/workflows/docs-link-check.yml; run it locally from the
repository root with:

    python3 .github/scripts/check_doc_links.py

What it checks, in every tracked .md or .markdown file, any case (git ls-files):
- inline links and images [text](target), reference definitions [id]: target,
  and href/src attributes in inline HTML (quoted or not); footnotes are not links;
- a relative target (file or directory) exists inside the repository (symlinks
  resolved), from the file's directory, or from the root when it starts with "/";
- an anchor (#section, or other.md#section) matches a heading in the target
  Markdown file, using GitHub's heading IDs, or an explicit id/name attribute;
  fragments are case-sensitive, as in the browser.

Links inside fenced code blocks (also in block quotes and list items),
indented code blocks, code spans (also across lines) and HTML comments are
ignored: they are examples, not links. External links (http, https) are skipped
unless --external is given, so the default check needs no network and gives
the same result on every run. Standard library only (Python 3.8+).

A Markdown file that is not UTF-8 is reported as a problem, not skipped.
"""

import argparse
import os
import re
import subprocess
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

# Any indent: a fence nested in a list item sits 4+ spaces in and is still code.
FENCE_RE = re.compile(r"^[ \t]*(`{3,}|~{3,})(.*)$")
QUOTE_PREFIX_RE = re.compile(r"^(?: {0,3}>[ \t]?)+")
ATX_HEADING_RE = re.compile(r"^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$")
SETEXT_UNDERLINE_RE = re.compile(r"^ {0,3}(=+|-+)[ \t]*$")
# [label]: destination (the destination may start on the next line); [^note]: is a footnote.
# Only an optional title may follow the destination on its line; "[Note]:" before prose is text.
REF_DEF_RE = re.compile(r"^ {0,3}\[(?!\^)((?:[^\]\\]|\\.)+)\]:[ \t]*\n?[ \t]*(<[^>\n]*>|\S+)"
                        r"""(?:[ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^)\n]*\)))?[ \t]*$""", re.M)
HTML_TAG_RE = re.compile(r"<[A-Za-z][A-Za-z0-9-]*\s[^<>]*>")
ATTR_VALUE = r"""\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))"""
HTML_LINK_ATTR_RE = re.compile(r"\b(?:href|src)" + ATTR_VALUE, re.I)
HTML_ID_ATTR_RE = re.compile(r"\b(?:id|name)" + ATTR_VALUE, re.I)
# A code span: a run of N backticks, closed by a run of exactly N, not across a blank line.
INLINE_CODE_RE = re.compile(r"(?<!`)(`+)(?!`)((?:(?!\n[ \t>]*\n)[\s\S])+?)(?<!`)\1(?!`)")
ESCAPE_RE = re.compile(r"\\([!-/:-@\[-`{-~])")
SCHEME_RE = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")
MARKDOWN_EXTENSIONS = (".md", ".markdown")


def markdown_files(root):
    try:
        out = subprocess.run(
            ["git", "ls-files", "-z"], cwd=root, check=True, capture_output=True,
        ).stdout.decode("utf-8")
        paths = [p for p in out.split("\0") if p]
    except (OSError, subprocess.CalledProcessError):
        paths = []
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in (".git", "node_modules")]
            paths += [os.path.relpath(os.path.join(dirpath, n), root) for n in filenames]
    return sorted(p for p in paths if p.lower().endswith(MARKDOWN_EXTENSIONS))


def blank(match_or_text):
    """Replace every character but line breaks with spaces, so offsets and line numbers stay right."""
    text = match_or_text if isinstance(match_or_text, str) else match_or_text.group(0)
    return re.sub(r"[^\n]", " ", text)


LIST_ITEM_RE = re.compile(r"^( *)([-*+]|\d{1,9}[.)])( {1,4}|$)")


def indent_of(line):
    return len(line.expandtabs(4)) - len(line.expandtabs(4).lstrip(" "))


def mask_indented_code(lines):
    """Blank out indented code blocks: 4+ spaces beyond the enclosing list item's
    content, after a blank line. List items nest; their continuation paragraphs stay text."""
    out = []
    contents = []    # content columns of the open list items, innermost last
    code_at = None   # indent that keeps the current code block going
    prev_blank = True
    for line in lines:
        if not line.strip():
            out.append(line)
            prev_blank = True
            continue
        indent = indent_of(line)
        if code_at is not None and indent >= code_at:
            out.append(blank(line))
            prev_blank = False
            continue
        code_at = None
        item = LIST_ITEM_RE.match(line)
        if prev_blank or item:
            while contents and indent < contents[-1]:
                contents.pop()  # dedented: those list items ended
        content = contents[-1] if contents else 0
        if prev_blank and indent >= content + 4:
            code_at = content + 4
            out.append(blank(line))
        elif item:
            contents.append(len(item.group(1)) + len(item.group(2)) + max(len(item.group(3)), 1))
            out.append(line)
        else:
            out.append(line)
        prev_blank = False
    return out


def mask(text, inline_code=True):
    """Blank out HTML comments, fenced code blocks (also in block quotes and list
    items), indented code blocks and, optionally, code spans."""
    text = re.sub(r"<!--.*?-->", blank, text, flags=re.S)
    out = []
    fence = None
    for line in text.split("\n"):
        body = QUOTE_PREFIX_RE.sub("", line)
        match = FENCE_RE.match(body)
        if fence:
            if match and match.group(1)[0] == fence[0] and len(match.group(1)) >= len(fence) \
                    and not match.group(2).strip():
                fence = None
            out.append(blank(line))
        elif match and not (match.group(1)[0] == "`" and "`" in match.group(2)):
            fence = match.group(1)
            out.append(blank(line))
        else:
            out.append(line)
    text = "\n".join(mask_indented_code(out))
    if inline_code:
        text = INLINE_CODE_RE.sub(blank, text)
    return text


def line_of(text, offset):
    return text.count("\n", 0, offset) + 1


def unescape(target):
    return ESCAPE_RE.sub(r"\1", target)


def inline_link_targets(text):
    """(offset, target) for every [text](target) and ![alt](target); the target may follow a line break."""
    targets = []
    start = 0
    while True:
        pos = text.find("](", start)
        if pos < 0:
            return targets
        start = pos + 2
        paragraph_start = max(text.rfind("\n\n", 0, pos), 0)
        if "[" not in text[paragraph_start:pos]:
            continue
        i = pos + 2
        while i < len(text) and text[i] in " \t\n":
            if text.startswith("\n\n", i):
                break
            i += 1
        if i < len(text) and text[i] == "<":
            end = text.find(">", i)
            if end < 0 or "\n" in text[i:end]:
                continue
            targets.append((i, unescape(text[i + 1:end])))
            continue
        depth = 0
        j = i
        while j < len(text):
            ch = text[j]
            if ch == "\\":
                j += 2
                continue
            if ch in " \t\n":
                break
            if ch == "(":
                depth += 1
            elif ch == ")":
                if depth == 0:
                    break
                depth -= 1
            j += 1
        if j > i:
            targets.append((i, unescape(text[i:j])))


def html_attr_values(text, attr_re):
    """(offset, value) for each matching attribute inside an HTML tag."""
    for tag in HTML_TAG_RE.finditer(text):
        for match in attr_re.finditer(tag.group(0)):
            value = next(v for v in match.groups() if v is not None)
            yield tag.start() + match.start(), value


def heading_text_to_plain(text):
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"!?\[([^\]]*)\]\[[^\]]*\]", r"\1", text)
    text = re.sub(r"(`+)(.+?)\1", r"\2", text)
    text = unescape(text)
    text = text.replace("*", "")
    text = re.sub(r"(^|\W)_+|_+(\W|$)", r"\1\2", text)
    return text.strip()


def github_slug(text):
    """GitHub's heading ID: lowercase, punctuation and symbols dropped, spaces to '-'."""
    kept = []
    for ch in heading_text_to_plain(text).lower():
        if ch in "-_ " or unicodedata.category(ch)[0] in "LNM":
            kept.append(ch)
    return "".join(kept).replace(" ", "-")


def anchors_of(text):
    """Every anchor a Markdown file defines: heading IDs and id/name attributes.

    Repeated headings get -1, -2, ... skipping IDs already taken, as GitHub
    (github-slugger) does: "foo", "foo-1", "foo" give foo, foo-1, foo-2.
    """
    masked = mask(text, inline_code=False)
    anchors = set()
    occurrences = {}
    previous = None
    for line in masked.split("\n"):
        heading = None
        atx = ATX_HEADING_RE.match(line)
        if atx:
            heading = atx.group(2) or ""
        elif previous and previous.strip() and SETEXT_UNDERLINE_RE.match(line) \
                and not ATX_HEADING_RE.match(previous) and not previous.lstrip().startswith(("-", "*", "+", ">", "|")):
            heading = previous.strip()
        if heading is not None:
            base = result = github_slug(heading)
            while result in occurrences:
                occurrences[base] += 1
                result = "%s-%d" % (base, occurrences[base])
            occurrences[result] = 0
            anchors.add(result)
        previous = line
    anchors.update(value for _, value in html_attr_values(masked, HTML_ID_ATTR_RE))
    return anchors


def external_ok(url, timeout):
    """None when the URL answers; a reason when it is gone (404/410) or unreachable.

    Other HTTP errors (401, 403, 429, 5xx...) count as reachable: sites refuse
    bots, rate-limit or fail for a moment, and the check must not flap. Links
    to private repositories answer 404 without credentials, so they fail here.
    """
    code = None
    for method in ("HEAD", "GET"):
        request = urllib.request.Request(url, method=method, headers={"User-Agent": "docs-link-check"})
        try:
            urllib.request.urlopen(request, timeout=timeout).close()
            return None
        except urllib.error.HTTPError as error:
            code = error.code
        except (urllib.error.URLError, OSError, ValueError) as error:
            if method == "GET":
                return str(getattr(error, "reason", error))
    return "HTTP %d" % code if code in (404, 410) else None


def read_text(path):
    """The file's text, or None when it is not UTF-8 (reported, not a crash)."""
    try:
        with open(path, encoding="utf-8") as handle:
            return handle.read()
    except UnicodeDecodeError:
        return None


def check(root, external=False, timeout=15):
    root = os.path.abspath(root)
    files = markdown_files(root)
    anchor_cache = {}
    problems = []
    link_count = 0

    def anchors_for(path):
        if path not in anchor_cache:
            text = read_text(path)
            anchor_cache[path] = anchors_of(text) if text is not None else set()
        return anchor_cache[path]

    real_root = os.path.realpath(root)
    for rel in files:
        source = os.path.join(root, rel)
        if not os.path.isfile(source):
            continue
        text = read_text(source)
        if text is None:
            problems.append((rel, 1, None, "the file is not valid UTF-8, so its links cannot be checked"))
            continue
        text = mask(text)
        targets = inline_link_targets(text)
        targets += [(m.start(2), unescape(m.group(2).strip("<>"))) for m in REF_DEF_RE.finditer(text)]
        targets += list(html_attr_values(text, HTML_LINK_ATTR_RE))
        for offset, target in sorted(targets):
            number = line_of(text, offset)
            target = target.strip()
            if not target:
                continue
            link_count += 1
            if target.startswith("//") or SCHEME_RE.match(target):
                url = "https:" + target if target.startswith("//") else target
                if external and url.lower().startswith(("http://", "https://")):
                    error = external_ok(url, timeout)
                    if error:
                        problems.append((rel, number, target, "external link failed: %s" % error))
                continue
            path_part, _, fragment = target.partition("#")
            path_part = urllib.parse.unquote(path_part.split("?", 1)[0])
            if path_part:
                base = root if path_part.startswith("/") else os.path.dirname(source)
                resolved = os.path.normpath(os.path.join(base, path_part.lstrip("/")))
                inside = os.path.relpath(os.path.realpath(resolved), real_root)
                if inside == os.pardir or inside.startswith(os.pardir + os.sep):
                    problems.append((rel, number, target, "points outside the repository"))
                    continue
                if not os.path.exists(resolved):
                    problems.append((rel, number, target, "file or directory not found"))
                    continue
            else:
                resolved = source
            if fragment and os.path.isfile(resolved) and resolved.lower().endswith(MARKDOWN_EXTENSIONS):
                anchor = urllib.parse.unquote(fragment)
                # Fragments are case-sensitive: #Foo does not reach the heading ID foo.
                if anchor not in anchors_for(resolved):
                    problems.append((rel, number, target, "anchor #%s not found in %s"
                                     % (anchor, os.path.relpath(resolved, root))))
    return files, link_count, problems


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--root", default=".", help="repository root (default: current directory)")
    parser.add_argument("--external", action="store_true",
                        help="also request http(s) links (needs network; off by default)")
    parser.add_argument("--timeout", type=float, default=15, help="seconds per external request")
    args = parser.parse_args(argv)

    files, link_count, problems = check(args.root, args.external, args.timeout)
    annotate = os.environ.get("GITHUB_ACTIONS") == "true"
    for rel, number, target, reason in problems:
        message = reason if target is None else "Broken link %s (%s)" % (target, reason)
        if annotate:
            print("::error file=%s,line=%d::%s" % (rel, number, message))
        else:
            print("%s:%d: %s" % (rel, number, message))
    mode = "relative links and anchors, external links included" if args.external \
        else "relative links and anchors; external links not checked"
    print("Docs link check: %d Markdown files, %d links (%s), %d broken."
          % (len(files), link_count, mode, len(problems)))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
