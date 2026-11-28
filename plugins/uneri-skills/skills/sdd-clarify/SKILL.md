---
name: sdd-clarify
description: Use after requirements are approved and before design — surfaces ambiguities, and contradictions between requirements, as structured questions and records the answers in the requirements' Clarifications section. Mandatory gate before `/uneri-skills:sdd-design` (records "No open questions" when there are none). Triggers include "clarify requirements", "spec clarify".
---

# uneri-skills:sdd-clarify — resolve ambiguities before design

## Overview

Reads the approved `requirements.md` and surfaces ambiguities as structured questions before any
design work begins. Always advances `spec.json` to `phase: clarified` — even when there are zero
questions (records "No open questions." explicitly). This phase bump is what `/uneri-skills:sdd-design`
checks before it will run. **Local-only** — no `gh`, no MCP.

## Gate (hard rule — check first)

**REFUSE to proceed** unless `.kiro/specs/<slug>/spec.json` has `approvals.requirements.approved == true`.

If the approval flag is missing or `false`:

> **Error:** Requirements have not been approved yet. Review `requirements.md`, then approve it: say that
> the requirements are approved, or run `/uneri-skills:sdd-requirements <slug>` and confirm (run it first if
> `requirements.md` has not been generated). Then re-run `/uneri-skills:sdd-clarify`.

Do not ask any questions, do not write any file, and do not continue until this condition is
satisfied.

**Re-open exception (revisiting a clarification).** When the spec already advanced past `clarified`
(`phase` is `design-generated` / `tasks-generated` / `implemented`) and a later review finds that an
earlier clarification answer itself was wrong or incomplete — not the underlying requirements, and
not merely the design — re-running this skill **is allowed** as long as `approvals.requirements.approved
== true` still holds. This is not a full requirements rewrite (use `/uneri-skills:sdd-requirements`'s own
re-open exception for that); it only appends/corrects entries under `## Clarifications`. Re-opening
resets the downstream approvals it invalidates:

- Set `phase: "clarified"` again.
- Reset `approvals.design.generated: false`, `approvals.design.approved: false`.
- Reset `approvals.tasks.generated: false`, `approvals.tasks.approved: false`.
- Reset `ready_for_implementation: false`.
- `approvals.requirements.*` is untouched — the requirements themselves did not change.

If instead the **UC's goal itself changed** (see `uneri-skills:udd-authoring` § Re-work vs goal change), do
**not** reuse this spec — spin a new UC + new spec.

## Language

Read language from `spec.json` → `language`. If absent, fall back to `.uneri.json` → `lang`, then
default `en`. This skill takes **no `--lang`** — language is already resolved and stored in
`spec.json` by `/uneri-skills:sdd-init`.

## Steps

1. **Read `spec.json`** from `.kiro/specs/<slug>/`. Check `approvals.requirements.approved == true`
   (gate above). Note the `language` field.

2. **Read `requirements.md`** from `.kiro/specs/<slug>/requirements.md`. Scan every requirement for
   ambiguities in these categories:

   | Category                        | What to look for                                                                                                 |
   | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
   | Undefined terms                 | Domain nouns used without a glossary entry or inline definition                                                  |
   | Missing limits                  | Quantities, timeouts, or thresholds left open (e.g. "many", "quickly")                                           |
   | Unspecified external obligation | A rule cited by name ("comply with …", "follow the guideline") with no stated duty, prohibition, record or check |
   | Unclear actors                  | An actor role that is not defined in `actors.md` or not clear from context                                       |
   | Unspecified error handling      | A failure scenario whose resolution is not described (e.g. "the system SHALL handle")                            |
   | Hard-to-reverse decisions       | Choices that force rework if changed after implementation (see below)                                            |

   Also take each `<!-- open for sdd-clarify: … -->` comment that `/uneri-skills:sdd-requirements` left under
   `## Clarifications` as a candidate ambiguity; it counts toward the 3-question limit like any other.

   **Hard-to-reverse decisions** — persisted data shape or identifiers, public API/URL contracts,
   external-system identifiers, tenancy/ownership boundaries, irreversible state transitions. These
   are the only ambiguities worth settling before design even when the wording looks clear: ask them
   **first**, as yes/no (or pick-one) questions, and keep to **1–2 questions** — a decision that is
   cheap to change later belongs in design or implementation, not here.

   **Then read the requirements against each other.** The categories above look at one requirement at a time;
   this pass looks at the interactions:

   | Cross-requirement check  | What to look for                                                                                      |
   | ------------------------ | ----------------------------------------------------------------------------------------------------- |
   | Contradictions           | Two requirements that cannot both hold (e.g. "SHALL delete immediately" vs. "SHALL keep for 30 days") |
   | Conflicting constraints  | A functional requirement whose behavior breaks a non-functional one (latency, availability, audit)    |
   | Boundary and concurrency | Two actors or requests touching the same thing at once, or a limit's edge, with no stated outcome     |

   Report these as **one list**, not as questions: for each finding quote the requirements involved
   (by number), say in a line why they conflict, and propose a resolution. Report only a conflict you
   can quote from the text; never invent one to have something to report.

3. **Ask structured questions** — hard-to-reverse decisions first, then the rest, one topic at a time, waiting for the user's answer before moving
   on. Frame each question clearly: quote the ambiguous fragment, state why it is ambiguous, and ask
   for the concrete value or decision. If there are **no** ambiguities, skip this step and record
   "No open questions." in the next step.

   **Keep the number of questions low** — the most common complaint about clarification is that there are
   too many. Ask at most **3 questions** in total; an ambiguity beyond that is recorded under the
   Clarifications entry as an open point for design, not asked. The cross-requirement findings do not
   count as questions: present the list from step 2 once, and let the user answer it in a single reply
   (accept the proposed resolutions, or correct them). A finding whose only resolution is to change
   the wording of a requirement is not settled here — tell the user, and point to
   `/uneri-skills:sdd-requirements` (its re-open exception); do not edit `requirements.md` beyond the
   Clarifications section.

4. **Append answers under `## Clarifications`** in `requirements.md`. Do **not** rewrite or delete
   any existing content — append only (on a re-open correcting a prior answer, append a new dated
   entry noting the correction rather than editing the old one — the append-only trail stays intact).
   Once an `open for sdd-clarify` point is answered, or recorded as an open point for design, its comment
   stays in place; only append. Use this format:

   ```markdown
   ## Clarifications

   <!-- filled by /uneri-skills:sdd-clarify -->

   - **Q:** <question text>
     **A:** <answer text>
   ```

   If there were no questions, append:

   ```markdown
   ## Clarifications

   <!-- filled by /uneri-skills:sdd-clarify -->

   No open questions.
   ```

5. **Update `spec.json`**:
   - Set `phase: "clarified"`.
   - Refresh `updated_at` to the current ISO-8601 UTC timestamp, read from the clock (e.g. `date -u +%Y-%m-%dT%H:%M:%SZ`). If the clock cannot be read, leave `updated_at` as it is and say so; never write an estimated time.
   - **On a re-open** (see Gate above): also reset `approvals.design.*`, `approvals.tasks.*`, and
     `ready_for_implementation: false`.

6. **Point to the next step**: tell the user to run `/uneri-skills:sdd-design` to begin design.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                     | ✅ Correct                                                                                                                         |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Running before `approvals.requirements.approved == true`       | Hard-refuse; gate checks the approval flag before any work                                                                         |
| Skipping the `phase` bump when there are no questions          | Always set `phase: clarified` — `/uneri-skills:sdd-design` hard-refuses unless `phase == clarified`                                |
| Rewriting or truncating `requirements.md`                      | **Append only** under `## Clarifications`; never touch existing requirement text                                                   |
| Omitting "No open questions." when there is nothing to clarify | Record "No open questions." explicitly — a missing entry looks like an incomplete run                                              |
| Asking all questions at once without waiting for answers       | One topic at a time; record each answer before moving to the next question                                                         |
| Re-opening without resetting downstream approvals              | Correcting a clarification after design/tasks exist must reset `approvals.design.*`/`approvals.tasks.*`/`ready_for_implementation` |
| Editing a past clarification answer in place                   | Append-only: record the correction as a new dated entry instead                                                                    |
| Turning every contradiction into its own question              | List them once with a proposed resolution; the user answers in one reply; total questions stay at 3 or fewer                       |
| Reporting a "conflict" that the text does not support          | Quote the requirement numbers involved; if you cannot quote both sides, it is not a finding                                        |
