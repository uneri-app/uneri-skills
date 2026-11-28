---
name: sdd-tasks
description: Use after design approval to break the design into a checkbox task list grouped by use case, each task tagged with `_UC:` and `_Requirements:`. Refuses to run until the design is approved. Triggers include "generate tasks", "spec tasks".
---

# uneri-skills:sdd-tasks — break approved design into a traceable task list

## Overview

Reads the approved `design.md` and `requirements.md`, then writes
`.kiro/specs/<slug>/tasks.md` — a checkbox task list grouped under the UC heading. Every task
and sub-task carries `_UC:` and `_Requirements:` metadata for traceability. Parallelizable
tasks are marked `(P)`. **Local-only** — no `gh`, no MCP.

## Gate (hard rule — check first)

**REFUSE to proceed** unless `.kiro/specs/<slug>/spec.json` satisfies:

- `approvals.design.approved == true`

If this condition is not met:

> **Error:** The design has not been approved yet. Run `/uneri-skills:sdd-design` to generate the
> design, then ask the user to review and approve it (set `approvals.design.approved: true` in
> `spec.json`) before running `/uneri-skills:sdd-tasks`.

Do not ask any questions, do not write any file, and do not continue until the condition is
satisfied.

**After a review-driven redesign:** a design re-open (`/uneri-skills:sdd-design`) resets `approvals.design.approved` and
`approvals.tasks.*` to false, so this gate will correctly refuse until the revised design is re-approved. Then re-run
this skill to **regenerate** `tasks.md` against the new design (do not hand-patch stale tasks) and obtain fresh PL
sign-off — this is expected, not an error.

## Language

Read language from `spec.json` → `language`. If absent, fall back to `.uneri.json` → `lang`,
then default `en`. This skill takes **no `--lang`** — language is already resolved and stored in
`spec.json` by `/uneri-skills:sdd-init`.

## Steps

1. **Read `spec.json`** from `.kiro/specs/<slug>/`. Check the gate condition (above). Note
   `language`, `traces_uc`, and `feature_name`.

2. **Read `design.md`** from `.kiro/specs/<slug>/design.md`. Pay attention to the Components,
   Data flow, and Boundary Commitments sections to identify implementation units.

3. **Read `requirements.md`** from `.kiro/specs/<slug>/requirements.md`. Note each requirement
   number (`1.1`, `1.2`, …) so tasks can reference them precisely.

4. **Write `tasks.md`** at `.kiro/specs/<slug>/tasks.md` following the skeleton below:

   - Open with a `## UC-<CTX>-NNN <feature>` heading (from `traces_uc` and `feature_name`).
   - **Every line is a Markdown checkbox `- [ ]`; hierarchy is carried by the number, not by
     indentation** (Kiro/cc-sdd tasks.md convention — the number is plain text after the checkbox,
     so there is no ordered-list marker to clash with the bullets).
   - Each design component / capability area is a **group major** line `- [ ] 1 <group>` (a
     summary; no metadata; **no trailing dot** — a `1.` would be reflowed by the Markdown formatter).
     Its tasks are flat siblings at the same list level: `- [ ] 1.1 <task>`, `- [ ] 1.2 <task>`, …
     Separate groups with a blank line.
   - Each numbered task (`N.M`) carries two required metadata lines nested (2-space indent) below it
     (plus the optional `Files:`/`Interfaces:` lines described further down):
     - `- *UC: UC-<CTX>-NNN*`
     - `- *Requirements: <number>, <number>*` (reference the requirement numbers from
       `requirements.md` that this task satisfies). A task that covers behaviour recorded only in
       `## Clarifications` (no numbered criterion) cites that entry — `*Requirements: Clarification — <topic>*`
       — instead of borrowing the nearest number, so the trace stays true.
   - Mark parallelizable tasks with `(P)` at the end of the task description line.
   - Open the file with a `## Global Constraints` section (right below the UC heading, before the
     first group) — project-wide constraints copied **verbatim** from `design.md`/`requirements.md`
     that every task implicitly inherits: version floors, naming/copy rules, dependency limits,
     cross-cutting boundary rules. One line each. Every task's implementer reads this section once
     instead of re-deriving the same constraints per task. Omit the section only if the spec
     genuinely has no such cross-cutting constraints — do not leave it as an empty placeholder.
   - **Pin `Files:` and `Interfaces:` for a task whenever `design.md` already decides them** — i.e.
     the design names the concrete file(s) and the exact signature(s) a unit exposes/consumes, not
     just its responsibility in prose. Nest both as 2-space-indented detail lines directly below the
     task's `_UC:`/`_Requirements:` lines:
     - `- *Files:* Create: \`path/to/new.ts\`; Modify: \`path/to/existing.ts\``— exact paths (add a
       line range for a targeted modification when design.md is that specific, e.g.`:120-145`).
     - `- *Interfaces:* Consumes: <exact signature(s) this task calls, from an earlier task or
       existing code>; Produces: <exact signature(s)/exported name(s) later tasks rely on>` — the
       implementer of a later task never sees an earlier task's own text, only this line, so it must
       be the exact name/type, not a paraphrase.
       Skip these two lines for a task whose design.md source is genuinely open to implementer judgment
       (exploratory, or the design only states intent) — do not invent a false-precision signature. Do
       not pin them "for consistency" on every task; a doc-only or config-only task has neither.
   - **End the file with a `## Implementation Notes` section** (below every task group) so
     `/uneri-skills:sdd-impl` has a fixed anchor to append to. Keep the heading **verbatim in English**
     (`## Implementation Notes`) — other skills match it as a literal string, so it is a structural
     marker like the UC IDs, not localized prose. Seed it with the HTML comment from the skeleton
     (localize the comment text if you wish; the heading stays English).
   - Localize all headings and prose to `spec.json.language`; keep UC IDs, requirement numbers,
     the `## Implementation Notes` heading, and Markdown checkbox syntax verbatim.
   - **Live-document re-generation (tasks.md already exists).** `tasks.md` is a living document:
     after implementation, a design change can bring `/uneri-skills:sdd-tasks` back to add tasks. When the
     file already exists, do **NOT** overwrite it wholesale:
     - **Preserve** every existing checkbox **completion state** (`- [x]` stays `[x]`) and the
       **entire `## Implementation Notes` section and its content**.
     - **Add new tasks ABOVE the `## Implementation Notes` heading** — into the relevant existing
       group, or as new trailing groups — continuing the existing group/number sequence. Never
       append new tasks after the notes section; the notes always remain the final section.
     - Only re-number or restructure completed tasks if the design change genuinely invalidates
       them; if so, say what changed rather than silently rewriting history.

5. **Self-review the whole task list before asking for approval** (a check you run yourself over the
   file you just wrote — not a subagent dispatch):
   - **Spec coverage**: every requirement number in `requirements.md` appears in at least one task's
     `_Requirements:` line. List any gap and add the missing task.
   - **Interface consistency**: for every pinned `Interfaces:` line, does a later task's `Consumes:`
     name/type match verbatim what an earlier task's `Produces:` declared? A mismatch (e.g. `parseUser()`
     produced but `parseUserRecord()` consumed) is a plan bug — fix the drift now, before any code exists.
   - **No false precision**: no `Files:`/`Interfaces:` line is a placeholder, a vague restatement, or
     "same as task N.M" — either it is exact, or it is omitted per the guidance above.
     Fix anything found inline; no need to re-run the check afterward.

6. **Update `spec.json`**:
   - Set `phase: "tasks-generated"`.
   - Set `approvals.tasks.generated: true`.
   - Refresh `updated_at` to the current ISO-8601 UTC timestamp, read from the clock (e.g. `date -u +%Y-%m-%dT%H:%M:%SZ`). If the clock cannot be read, leave `updated_at` as it is and say so; never write an estimated time.

7. **Ask the user to review** the generated `tasks.md`. When they confirm the tasks are correct:
   - Set `approvals.tasks.approved: true` in `spec.json`.
   - Set `ready_for_implementation: true` in `spec.json` — this is the only place that flag is set
     to `true`; `/uneri-skills:sdd-init` creates it `false` and a design re-open resets it to `false`, but
     nothing else advances it.
   - Refresh `updated_at` to the current ISO-8601 UTC timestamp, read from the clock (e.g. `date -u +%Y-%m-%dT%H:%M:%SZ`). If the clock cannot be read, leave `updated_at` as it is and say so; never write an estimated time.
   - The next step is `/uneri-skills:sdd-impl` (TDD + subagent dispatch), followed by `/uneri-skills:sdd-validate-impl`
     as the feature-level GO/NO-GO gate. If the user asked to carry the spec through to implementation (an explicit request to implement — e.g. "implement it", "実装まで進めて", "最後まで" — not merely "generate the tasks" or "get this going"),
     **continue into `/uneri-skills:sdd-impl` without stopping**; if they only asked for the tasks, suggest it
     as the next step instead of starting it.
   - Suggest `/uneri-skills:sdd-trace` to audit traceability across UC → spec → tasks.
   - Note: `/uneri-skills:sdd-validate-impl` will also persist an executable `verification.md` sidecar (re-runnable checks + a requirements→check traceability table) — the canonical way to re-verify the feature later.

## The `tasks.md` it writes

Write this file at `.kiro/specs/<slug>/tasks.md`. Substitute real values for `<feature>`,
`<CTX>`, `NNN`, and task descriptions. Localize headings and prose to `spec.json.language`;
keep UC IDs, requirement numbers, and checkbox syntax verbatim:

```markdown
## UC-<CTX>-NNN <feature>

## Global Constraints

- <constraint copied verbatim from design.md/requirements.md, one line each>

- [ ] 1 <group>
- [ ] 1.1 <task> (P)
  - *UC: UC-<CTX>-NNN*
  - *Requirements: 1.1, 1.2*
  - *Files:* Create: `path/to/new.ts`
  - *Interfaces:* Produces: `exportedFunction(arg: Type): ReturnType`
- [ ] 1.2 <task>
  - *UC: UC-<CTX>-NNN*
  - *Requirements: 1.3*
  - *Files:* Modify: `path/to/existing.ts:40-55`
  - *Interfaces:* Consumes: `exportedFunction(arg: Type): ReturnType` (from 1.1)

- [ ] 2 <group>
- [ ] 2.1 <task>
  - *UC: UC-<CTX>-NNN*
  - *Requirements: 1.4, 1.5*

## Implementation Notes

<!-- Cross-cutting insights are appended here by /uneri-skills:sdd-impl during implementation.
     Keep this heading LAST — every task group stays above it. -->
```

Every line is a `- [ ]` checkbox at one list level; the **number** (`1` major / `1.1` sub) carries the
hierarchy — the number is plain text after the checkbox, so it never clashes with an ordered list. The
`*UC:*` / `*Requirements:*` / `*Files:*` / `*Interfaces:*` detail lines are nested (2-space indent) below
their task, in that order; `*Files:*`/`*Interfaces:*` appear only on tasks where design.md already pins
them (see step 4). Separate groups with a blank line. **Write the group major as `1` with no trailing dot**
(as Kiro's own output does): a trailing `1.` makes the Markdown formatter (`npm run md:fmt`, dprint) treat
it as an ordered-list marker and reflow the block.

The file **ends with a `## Implementation Notes` section** (heading kept **verbatim in English**). This is
the fixed anchor `/uneri-skills:sdd-impl` appends cross-cutting notes to during implementation. Seeding it here —
below every task group — prevents the implementer from inventing the heading mid-list (which would push
still-unchecked tasks below it and split the task list).

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                                                                             | ✅ Correct                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Running before design approval                                                                                         | Hard-refuse; check `approvals.design.approved == true` first                                                                                                 |
| Mixing an ordered list with checkbox bullets, nesting sub-tasks under the major, or a trailing dot on the major (`1.`) | Kiro convention: **all lines are `- [ ]` checkboxes at one level; hierarchy is the number** (`1` major / `1.1` sub, no trailing dot), only detail lines nest |
| Omitting `## Global Constraints`, or leaving it a placeholder                                                          | Copy spec-wide constraints verbatim from design.md/requirements.md right below the UC heading — omit the whole section only if there truly are none          |
| Pinning `Files:`/`Interfaces:` on every task "for consistency"                                                         | Pin them only where design.md already decided the concrete file(s)/signature(s); leave both off a task that is genuinely open to implementer judgment        |
| A pinned `Interfaces:` line that paraphrases instead of giving the exact signature/name                                | `Consumes:`/`Produces:` must be the exact name and type a later task can rely on verbatim — a paraphrase defeats the point                                   |
| Skipping the self-review pass before asking for approval                                                               | Run the spec-coverage / interface-consistency / no-false-precision check (step 5) yourself and fix issues inline before presenting `tasks.md`                |
| Omitting `_UC:` on a task                                                                                              | Every numbered task (`N.M`) must carry `- *UC: UC-<CTX>-NNN*` (the group major `N` is a summary line, no metadata)                                           |
| Omitting `_Requirements:` on a task                                                                                    | Every numbered task (`N.M`) must carry `- *Requirements: <numbers>*`                                                                                         |
| Not grouping tasks by UC                                                                                               | All tasks live under the `## UC-<CTX>-NNN <feature>` heading, grouped by component/capability                                                                |
| Omitting the trailing `## Implementation Notes` section, or localizing its heading                                     | End the file with a `## Implementation Notes` section below every task group; keep the heading **verbatim in English** (other skills match it literally)     |
| On re-run, overwriting `tasks.md` (losing `[x]` state / notes) or appending new tasks below `## Implementation Notes`  | Live document: preserve completion state + the notes section; insert new tasks **above** `## Implementation Notes`, which stays the final section            |
| Forgetting to update `spec.json`                                                                                       | Set `phase: tasks-generated`, `approvals.tasks.generated: true`, and `updated_at`                                                                            |
| Setting `approvals.tasks.approved` without user review                                                                 | Write the file and set `generated`; wait for explicit user confirmation before setting `approved`                                                            |
| Approving tasks without setting `ready_for_implementation: true`                                                       | Set both together — this is the only skill that ever sets this flag `true`                                                                                   |
| Telling the user implementation is out of scope / to hand tasks to cc-sdd                                              | Implementation is **in scope** via `/uneri-skills:sdd-impl`; point the user there (then `/uneri-skills:sdd-validate-impl`)                                   |
| Pointing to the wrong next step                                                                                        | After approval, tell the user to run `/uneri-skills:sdd-impl` → `/uneri-skills:sdd-validate-impl` → `/uneri-skills:sdd-trace`                                |
| Starting `/uneri-skills:sdd-impl` when the user only asked for the tasks                                               | Continue into it only if they asked to carry the spec through to implementation; otherwise suggest it as the next step                                       |
