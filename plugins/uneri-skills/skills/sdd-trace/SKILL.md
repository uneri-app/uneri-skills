---
name: sdd-trace
description: Use to audit UC↔spec↔requirement↔task consistency across the project — reports orphan specs, un-specced use cases, dangling task references, and requirement/scenario coverage gaps, and counts progress as implemented use cases out of active ones (deprecated use cases are not counted). Given a spec name (`/uneri-skills:sdd-trace <feature>`), also reports that spec's status — phase, approvals, task progress, next action. Reports only; never writes, never blocks. Triggers include "trace check", "整合を検査", "spec trace", "spec status", "進捗を見せて".
---

# uneri-skills:sdd-trace — audit UC↔spec↔requirement↔task consistency

## Overview

A **read-only** cross-layer audit of the three-layer trace: use cases → specs → requirements →
tasks. It reads `.kiro/uneri/use-cases.md`, every `.kiro/specs/*/spec.json` (`traces_uc`),
`requirements.md`, and `tasks.md`; runs four checks; and produces a grouped findings report.
**It never writes any file and never blocks.** Fix findings via the authoring skills
(`uneri-skills:sdd-init`, `uneri-skills:sdd-requirements`, `uneri-skills:sdd-tasks`) or by hand.

## When to use

- After any `uneri-skills:sdd-*` run to verify the three-layer trace is consistent.
- Anytime, to check which UCs are still un-specced or which task references are stale.
- **NOT** to fix issues — it reports only; fixes go through `uneri-skills:sdd-init` / `uneri-skills:sdd-requirements` / `uneri-skills:sdd-tasks` or manual edit.

## Language

Emit the report in the language from **`.uneri.json`** (`lang`, set by `/uneri-skills:udd-init`); this
skill **reads** it and takes **no `--lang`**. Localize prose; keep IDs, field keys (`UC-`, `traces_uc`), and requirement numbers verbatim.

## Steps

1. **Read use cases.** Resolve the layout from `.uneri.json` → `layout` (`single-context` ⇒ Pattern B,
   `multi-context` ⇒ Pattern A); if absent, detect it (`services/<ctx>/` tree ⇒ A, single root `.kiro/` ⇒ B), and on
   mismatch with the actual layout, note the discrepancy in the report. Then load `.kiro/uneri/use-cases.md`
   (Pattern B) or each `services/<ctx>/.kiro/uneri/use-cases.md` (Pattern A). Collect every `### UC-<CTX>-NNN`
   heading; note its number `NNN`.

2. **Read all specs.** Walk `.kiro/specs/*/spec.json`. For each spec, extract `traces_uc`,
   `feature_name`, and `phase`. The authoritative UC link is the **`traces_uc` field** — do not
   grep for a `traces:` marker (the link is the `traces_uc` field). Skip any spec whose `spec.json` is
   missing or unreadable (note it as unreadable, skip, continue).

3. **Run all four checks** (below), collecting findings.

4. **Count progress** (see *Progress count*).

5. **Spec status (only when a feature name is given).** Add the *Spec status* block below for that spec; with no
   argument, skip it.

6. **Report** findings grouped by spec (or UC, for un-specced UCs), with a summary count per
   check and the progress line. Explicitly state "no issues" when a check is clean.

## Checks

### Check 1 — Orphan spec

For every spec, confirm its `spec.json.traces_uc` value matches a UC id in `use-cases.md`.

**Orphan spec**: `traces_uc` value is set but no UC with that id exists in `use-cases.md`.

### Check 2 — Un-specced UC

For every UC in `use-cases.md`, confirm there exists at least one spec whose `traces_uc` equals
that UC id.

**Un-specced UC**: a UC id appears in `use-cases.md` but no spec's `traces_uc` references it.

> Note: a UC that carries a `deprecated:` marker (see `uneri-skills:udd-authoring`) is **intentionally out of scope for
> speccing** — do **not** report it as un-specced; instead list it separately as `deprecated (no spec expected)`.
> A UC that is merely deferred (no `deprecated:` marker, no spec yet) is still flagged so the author can confirm.

### Check 3 — Dangling task reference

For each spec that has a `tasks.md`:

1. Read `requirements.md` and collect the valid requirement numbers (`1.1`, `1.2`, `2.1`, …).
2. Read `tasks.md` and find every requirement reference in task metadata lines. Match **flexibly**
   — the annotation may be written in any of these forms (italic emphasis characters may be `*`
   or `_`, and the label may or may not have emphasis):
   - `- *Requirements: 1.1, 1.2*`
   - `- _Requirements: 1.1, 1.2_`
   - `- *Requirements:* 1.1, 1.2`
   - `- Requirements: 1.1, 1.2`
3. For each requirement number extracted from a metadata line, check whether it appears in that
   spec's `requirements.md`.

**Dangling task reference**: a requirement number referenced in `tasks.md` that does not exist in
the same spec's `requirements.md`.

### Check 4 — Coverage gap

For each spec's `requirements.md`, identify each numbered requirement (`1.1`, `1.2`, …). Then
check whether the requirement is referenced by at least one task metadata line in `tasks.md`
(using the same flexible matching as Check 3).

**Coverage gap**: a requirement in `requirements.md` that no task in `tasks.md` references.

> Skip this check for specs that have no `tasks.md` yet; note it as "tasks not yet generated —
> coverage check skipped".

## Progress count

Progress is the number of use cases that are done, out of the use cases that are still pursued:

- **Active use case:** a UC in `use-cases.md` that has **no `deprecated:` line**.
- **Implemented use case:** an active UC with a spec whose `spec.json` has `phase: "implemented"` (written by `/uneri-skills:sdd-validate-impl` on a GO).
- **Progress = implemented / active.** A **deprecated** use case is **left out of both numbers**, even if it has an implemented spec: a goal that is
  no longer pursued must not lower the completion rate. Report how many were left out.
- Both bands (functional and operational) are counted together.

## Spec status

With a feature name, report where that one spec stands, from `.kiro/specs/<feature>/`:

- **Phase and approvals:** `spec.json` `phase` and each approval (requirements, clarify, design, tasks) and `ready_for_implementation`.
- **Files:** which of `requirements.md`, `design.md`, `tasks.md` exist; count the requirements and, in `tasks.md`, completed (`- [x]`) against total (`- [ ]`) tasks.
- **Next action:** the next `/uneri-skills:sdd-*` step the approvals call for; name what blocks it (a missing approval, unanswered clarification).
- **Boundary context:** from `design.md`, `Boundary Commitments`, `Out of Boundary`, `Allowed Dependencies` and `Revalidation Triggers` when present; name neighbouring specs that may need revalidation if this one changes.

If the spec does not exist, say so and list the directories in `.kiro/specs/`. Still read-only; never blocks.

## Output format

Emit a report grouped by spec slug (one block per spec), followed by a summary. Use the project
language from `.uneri.json`.

```
uneri-skills:sdd-trace  —  orphan:<n>  un-specced:<n>  dangling:<n>  gaps:<n>

[008-order-tracking]  traces_uc: UC-SHP-008
  Check 1 (orphan spec):       OK
  Check 2 (un-specced UC):     OK
  Check 3 (dangling task ref): WARN  tasks.md references req 2.3 — not found in requirements.md
  Check 4 (coverage gap):      WARN  req 1.4 has no task

[un-specced UCs]
  UC-SHP-012  (no spec found — run /uneri-skills:sdd-init UC-SHP-012)

Summary: 0 orphan specs | 1 un-specced UC | 1 dangling task ref | 1 coverage gap
Progress: 1 of 3 active use cases implemented (1 deprecated, not counted)
```

Report **"no issues"** explicitly when all checks are clean. Localize labels and prose; keep IDs,
numbers, and field names verbatim.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                          | ✅ Correct                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Writing or editing any file                         | Report only — this skill is **strictly read-only**                                                     |
| Blocking or refusing when a spec or file is missing | Note the missing file, skip that check for that spec, and continue — never block                       |
| Counting a deprecated UC in the denominator         | Leave it out of both numbers and report how many were left out; progress = implemented / active        |
| Grepping for a `traces:` marker                     | Read `spec.json.traces_uc` exclusively; there is no grep marker                                        |
| Hardcoding `*Requirements:*` emphasis only          | Match flexibly: `*` or `_` emphasis, with or without emphasis on the label (see Check 3)               |
| Treating un-specced UCs as blocking errors          | Flag them as findings; do not stop; they may be intentionally deferred                                 |
| Reporting in the wrong language                     | Follow `.uneri.json` `lang`; localize prose, keep IDs/keys verbatim                                    |
| Running `gh` or MCP                                 | Local-only; no `gh`, no MCP, no network                                                                |
| Attempting to auto-fix findings                     | Point to the appropriate `uneri-skills:sdd-*` skill for each type of finding; do not fix automatically |
