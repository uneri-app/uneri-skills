---
title: The spec.json phase contract
description: How the phase field in spec.json moves, and which skill writes it.
---

This page defines how the `phase` field of `.kiro/specs/<slug>/spec.json` changes: which `sdd-*` skill writes which value, and under which gate.
uneri-skills is the **producer** of this field. Tools that read `spec.json` (dashboards, other tooling) follow this contract, not the other way around.

## 1. State transitions

Forward, one step at a time. `[start]` is the moment the spec directory is created.

| From                     | To                       | Skill                                      |
| ------------------------ | ------------------------ | ------------------------------------------ |
| `[start]`                | `initialized`            | `sdd-init`                                 |
| `initialized`            | `requirements-generated` | `sdd-requirements`                         |
| `requirements-generated` | `clarified`              | `sdd-clarify`                              |
| `clarified`              | `design-generated`       | `sdd-design`                               |
| `design-generated`       | `tasks-generated`        | `sdd-tasks`                                |
| `tasks-generated`        | `implemented`            | `sdd-validate-impl` (only on a GO verdict) |

Back, by reopening (section 2.1). A reopen overwrites `phase` with the value of the skill you re-run, and resets the approvals below it:

| Reopen with        | `phase` becomes          | Allowed from                                                                                           |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `sdd-design`       | `design-generated`       | `design-generated` (the design itself was wrong), `tasks-generated`, `implemented`                     |
| `sdd-clarify`      | `clarified`              | `design-generated` (a clarification answer was wrong), `tasks-generated`, `implemented`                |
| `sdd-requirements` | `requirements-generated` | `clarified`, `design-generated`, `tasks-generated`, `implemented` (the acceptance criteria were wrong) |

`implemented` is the only end state.

`phase` is a simple line that only moves forward. Each `sdd-*` skill advances it **right after it writes its own output**.
The only end state is `implemented`. There is no separate `validated` state: `implemented` is only reached through a GO verdict from `sdd-validate-impl`, so it already means "verified".

## 2. Who writes each value

| # | `phase` value            | Written by          | Gate (what must hold before the skill runs)                                         | Notes                                                                                                                                                                                                                                            |
| - | ------------------------ | ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | `initialized`            | `sdd-init`          | The use case exists in `use-cases.md`                                               | Written right after the spec directory and `spec.json` are created. If a spec already traces this use case through `traces_uc`, `sdd-init` stops and points you to the next skill instead (see section 4).                                       |
| 2 | `requirements-generated` | `sdd-requirements`  | `phase >= initialized`                                                              | Written right after the EARS requirements are generated.                                                                                                                                                                                         |
| 3 | `clarified`              | `sdd-clarify`       | `approvals.requirements.approved == true`                                           | Always advances to this value, even with zero questions ("no open questions" is recorded explicitly). Without this step `sdd-design` refuses to start.                                                                                           |
| 4 | `design-generated`       | `sdd-design`        | `approvals.requirements.approved == true` **and** `phase == "clarified"`            | Reopening is an exception (section 2.1).                                                                                                                                                                                                         |
| 5 | `tasks-generated`        | `sdd-tasks`         | `approvals.design.approved == true`                                                 | `tasks.md` is a living document: on a re-run it keeps completed `[x]` tasks and the Implementation Notes, and inserts new tasks above the notes. At the same time it sets `approvals.tasks.approved: true` and `ready_for_implementation: true`. |
| 6 | `implemented`            | `sdd-validate-impl` | Every task is `[x]`, the full test suite is green, and the other GO conditions hold | Written (with `updated_at`) when the verdict is GO. On NO-GO or MANUAL_VERIFY_REQUIRED, `phase` stays at `tasks-generated`.                                                                                                                      |

### 2.1 Three ways to reopen (an overwrite, not a step back)

A forward-only line needs a way back for when a review finds that a downstream artifact is wrong. There are three, and you choose by **the layer where the review found the flaw**.
Each one resets the approvals below it:

| Where the flaw is                                                 | Reopen with        | What is reset                                                                                            |
| ----------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| The design (requirements and acceptance criteria are still right) | `sdd-design`       | `approvals.design.*`, `approvals.tasks.*`, `ready_for_implementation`                                    |
| A clarification answer (the EARS items are still right)           | `sdd-clarify`      | The same as above                                                                                        |
| The acceptance criteria themselves                                | `sdd-requirements` | `approvals.requirements.approved`, `approvals.design.*`, `approvals.tasks.*`, `ready_for_implementation` |

Each can run without its usual gate (`phase == "clarified"` for design and clarify, `phase >= initialized` for requirements). For a design or clarify reopen, `approvals.requirements.approved == true` is still required.

**The test is the use case's goal, not its acceptance criteria.** A spec is a living document. Acceptance criteria are refined as a project goes on: edge cases are added, wording is corrected, boundary values are revisited.
As long as **the goal the use case is trying to meet has not changed** (the declared actor, purpose and `scope`), a change to acceptance criteria is revised inside the same use case and the same spec.
It is never a reason to cut a new use case. Choosing a reopen path is a separate question from whether to cut a new use case.

- Reopening is not free. Resetting the downstream approvals forces the later skills to be approved and generated again.
- If **the goal itself changed** (a different actor, a fundamentally different purpose, or a change you can only express by rewriting the declared `scope` in `use-cases.md`), use none of the three.
  Follow "Re-work vs goal change" in `uneri-skills:udd-authoring`: cut **a new use case and a new spec**, and mark the old use case `deprecated` with `superseded_by`. Never reuse the same spec.

## 3. `ready_for_implementation`

`sdd-init` creates `spec.json` with `ready_for_implementation: false`. `sdd-tasks` sets it to `true` together with the task approval. A reopen of design, clarify or requirements sets it back to `false`.
`sdd-impl` will not start unless the tasks are approved.

## 4. Preventing duplicate specs (`sdd-init` Step 0)

If a spec already traces the target use case through `traces_uc`, `sdd-init` does not create a new one. It points you to the next skill for that spec's `phase`:

| Existing spec's `phase`  | Points to                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `initialized`            | `/uneri-skills:sdd-requirements`                                                                                    |
| `requirements-generated` | `/uneri-skills:sdd-clarify`                                                                                         |
| `clarified`              | `/uneri-skills:sdd-design`                                                                                          |
| `design-generated`       | `/uneri-skills:sdd-tasks`                                                                                           |
| `tasks-generated`        | `/uneri-skills:sdd-impl` (or `/uneri-skills:sdd-validate-impl` if already implemented)                              |
| `implemented`            | Already implemented. Only if the design turns out to be wrong, reopen with `/uneri-skills:sdd-design` (section 2.1) |

Only when the use case's goal or scope itself changed do you bypass this and cut a new use case with a new spec (the same test as in section 2.1).
