---
name: sdd-compact
description: Use when a spec's `requirements.md` or `design.md` has accumulated history (dated additions, appended clarification Q&A, retired or "withdrawn" text), has drifted from the implementation, or links to documents outside the spec directory — rewrites both files to describe the spec as it is now, and nothing else, keeping every ID other files refer to. Edits only those two files. Triggers include "compact the spec".
argument-hint: <feature-name>
---

# uneri-skills:sdd-compact — make a spec describe the present, nothing else

## Overview

Over a spec's life, `requirements.md` and `design.md` collect history: clarification Q&A (`/uneri-skills:sdd-clarify`),
headings such as "(added 2026-11-02)", retired text, and links into documents outside the spec. They also drift from the
code. This skill rewrites the two files so that they describe **the spec as it is now, and nothing else**, and can be read and
acted on without opening any file outside the spec directory tree (`.kiro/`). History is not lost: git keeps it.

**Local-only** — no `gh`, no MCP, no network. Edit **only** `requirements.md` and `design.md` of the named spec.
`tasks.md`, `verification.md`, `research.md` and `spec.json` are read, never edited.

## When to use

- A spec has been clarified, extended or amended several times and now reads as a log.
- The implementation changed and the spec still describes the old behavior.
- The spec points into documents outside `.kiro/` (project docs, ADR files, wikis) that a reader must open to understand it.
- **NOT** to write or approve requirements or a design (`/uneri-skills:sdd-requirements`, `/uneri-skills:sdd-design`), to resolve new
  ambiguities (`/uneri-skills:sdd-clarify`), or to change what the use case is for. If the UC's goal itself changed, start a new
  UC and a new spec (see `uneri-skills:udd-authoring`).

## Language

Read language from `spec.json` → `language`. If absent, fall back to `.uneri.json` → `lang`, then default `en`. This skill
takes **no `--lang`**. Section names below are English; the report and the `(unverified)` / `(retired)` markers are written in the
spec's language.

## Steps

1. **Load** `.kiro/specs/<feature-name>/` (all files). Stop with a message if the spec does not exist.
2. **Find the numbers other files depend on.** Collect the acceptance-criteria numbers (`N.M`) that `tasks.md`,
   `verification.md`, code comments and tests refer to. Those numbers stay exactly as they are.
3. **Reconcile with the implementation.** Check each concrete claim in `design.md` and `requirements.md` (file paths, type and
   function names, endpoints, status codes, who is authorized, events) against the code with Glob and Grep. Correct what has
   drifted so the text matches the code.
   A claim you could not check stays in the text, marked `(unverified)`, and goes into the report. Nothing is dropped because it
   could not be confirmed.
   **Size check.** Before the report, compare each new file with its old one. Growth of `design.md` or `requirements.md` over
   10% means additions are present: remove each added sentence that neither replaces a wrong statement nor carries a folded
   decision. A value the spec did not state (a limit, a directory name, a story name, an i18n key) is such an addition, even when
   it is true.
4. **Fold history into the present.**
   - A clarification Q&A becomes part of the acceptance criterion or design section the decision affects; the Q&A block is removed.
   - A heading such as "(added 2026-11-02)" becomes a plain heading placed where the topic belongs.
   - A statement that was retired is deleted. If the retirement is itself a rule that still holds (for example "no optimistic
     locking"), state that rule in the present tense.
   - A retired acceptance criterion whose number other files still refer to keeps its number: as the present-tense rule that
     replaced it, or, when no rule remains, as one line `N. (retired)` with the reason in a few words. Report it.
5. **Make it self-contained.** Replace links or paths into other documents (project docs, wikis, other repositories) with the facts
   the spec needs. A path named as a document "to keep in sync" counts too: state the rule, and list the document in the report. An
   ADR is cited by its ID (`ADR-NNNN`) with a one- or two-line summary of the decision. Links to other files under
   `.kiro/` stay, written relative.
6. **Keep** requirement and event IDs, decisions and their reasons, the out-of-boundary list, and diagrams (update a diagram that
   has drifted).

## Changing what the spec says

- Reconciling may change what an acceptance criterion means (the code does something else). Follow the implementation, and list the
  criterion under "Criteria whose meaning changed".
- A decided behavior that existed only in a clarification may become a new acceptance criterion, numbered after the existing ones.
  List it under "Criteria added". No other criterion is added.
- Behavior that a `design.md` section describes and no acceptance criterion covers stays in `design.md`. It is not moved into
  `requirements.md`.
- "Criteria whose meaning changed" lists only criteria whose meaning changed. A criterion reworded without a change in meaning is not
  listed.

## Report

End with this report, in the spec's language. A section with nothing to say says so (for example "none").

| Section                        | Content                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Size                           | requirements / design, before → after (bytes, lines)                                            |
| Drift fixed                    | what drifted from the code, one line each                                                       |
| History folded                 | kinds and counts of history removed                                                             |
| Criteria whose meaning changed | number, before → after                                                                          |
| Criteria added                 | number, one line                                                                                |
| Unverified                     | claims kept and marked `(unverified)`                                                           |
| Conflicts in other files       | stale or conflicting text in `tasks.md` / `verification.md` / code comments, with file and line |

If the report lists a criterion whose meaning changed or one that was added, say so plainly and tell the user that `spec.json` was not
touched: whether the requirements or the design need a new approval is the user's decision (`/uneri-skills:sdd-requirements` and
`/uneri-skills:sdd-design` own the approvals).

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                        | ✅ Correct                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Renumbering acceptance criteria to close gaps                     | Numbers other files refer to stay exactly as they are; a retired one keeps its number |
| Editing `tasks.md`, `verification.md`, `research.md`, `spec.json` | Read them; report what conflicts, never edit                                          |
| Adding a limit, a name or a key the spec never stated             | Even a true value is an addition; the size check removes it                           |
| Dropping a claim because the code does not confirm it             | Keep it, mark `(unverified)`, report it                                               |
| Leaving a link into `docs/` or another repository                 | Replace it with the facts the spec needs; cite an ADR by ID with a short summary      |
| Moving design-only behavior into `requirements.md`                | It stays in `design.md`; no acceptance criterion is added for it                      |
| Keeping the Q&A block next to the folded answer                   | Fold the answer into the criterion or section, then remove the Q&A block              |
| Running `git` or touching files outside the two spec files        | Local edit of two files; the user commits                                             |
