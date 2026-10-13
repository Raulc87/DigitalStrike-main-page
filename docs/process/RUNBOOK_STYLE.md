# Runbook style

Runbooks are run by the human owner, often from a phone or an unfamiliar terminal. Every round-trip caused by an ambiguous step costs time. Write each runbook (`docs/runbooks/*.md`) so it can be followed by copying and pasting, without guessing.

## Rules

1. **Set values once, at the top.** A first "Values to have ready" table or a single "set values" command block holds every placeholder (`<domain>`, URLs, IDs). Later steps never contain a placeholder the reader must edit inside a command.
2. **One command block per step, nothing else in it.** No inline `#` comments in command blocks: zsh on macOS rejects pasted comment lines. Put explanations in the text above the block.
3. **Say what success looks like** after every step: the exact output, page, or row to expect, and what to do if it differs.
4. **Every operating system the owner uses.** Give macOS/Linux and Windows (PowerShell) variants where commands differ, including paths, quoting, and activation commands.
5. **A no-terminal alternative** where one exists (a GitHub UI path, a control-panel screen, a browser check).
6. **UI steps name exactly what to click**, in order, including the control that decides the action. Example: in Google Apps Script, the function that runs is the one selected in the toolbar dropdown, not the one under the cursor.
7. **No placeholder URLs that look real.** Use `<preview URL>` style, never an example address that loads a misleading page.
8. **Secrets never go into chat, issues, or files.** Steps that involve a secret say where to paste it (a settings screen, a password prompt) and nothing else.
9. **A troubleshooting table** at the end: symptom, likely cause, fix.
10. **Dates and versions** in the runbook header, updated when the steps change.

## Checklist for a reviewer

- [ ] No placeholder inside a command after the "values" step
- [ ] No `#` comment lines inside command blocks
- [ ] Every step states its expected result
- [ ] macOS/Linux and Windows variants where needed
- [ ] No secret values, real IDs or personal data
