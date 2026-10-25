## Summary

<!-- What this PR does, in 1–3 sentences. -->

## Ownership

<!-- Required. Use the agent and workstream names from the active sprint plan's File Ownership Map. -->

- Owner: <!-- e.g. Agent 1 — UI, content, i18n / Human owner (docs) -->
- Owned paths changed: <!-- list the paths, or "all within owner scope" -->
- Changes outside owner scope: <!-- "None", or each file + who approved it + why -->
- Depends on: <!-- other PRs/branches this builds on, or "main only" -->

## Stories and acceptance criteria

<!-- Branch: <KEY>-<NNN>-<slug> or <KEY>-<TYPE>-<slug>. Title: [<KEY>-<NNN>] ... -->

| Story | Acceptance criteria covered |
|---|---|
| US-XXX | AC1, AC2 |

## Verification evidence

<!-- Tests run and results, screenshots, commands. -->

- [ ] Lint / type checks pass
- [ ] Unit tests pass
- [ ] End-to-end / integration checks pass (if the critical flow is touched)

## Risks, assumptions, and unresolved items

-

## Checklist

- [ ] Only files owned by this workstream were changed, or every exception is listed and approved under Ownership
- [ ] No unrelated refactors
- [ ] Not merged by an agent: merging is done only by the human owner after approval
- [ ] Security baseline (`AGENTS.md` → Security baseline): the OWASP acceptance criteria this change touches are verified, no secrets or credentials are committed, and new or updated dependencies are checked (scanned once the project has dependency scanning)
- [ ] Documentation updated if behavior or contracts changed
