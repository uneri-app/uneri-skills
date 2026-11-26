---
name: sdd-requirements
description: Use after `/uneri-skills:sdd-init` to generate EARS requirements for a spec, auto-seeded from the traced use case's sunny-day and rainy-day scenarios. Refuses to run until the spec exists. Triggers include "generate requirements", "requirements を作る", "spec requirements". Output language follows `.uneri.json` / `spec.json`.
---

# uneri-skills:sdd-requirements — generate EARS requirements from a UC

## Overview

Reads `spec.json` (written by `/uneri-skills:sdd-init`), traces back to the originating UC, and generates
**EARS-format requirements** seeded from the UC's scenarios: one sunny-day scenario plus rainy-day
scenarios covering validation failure, authorization denial, concurrent-edit conflict, and
external-system failure (where applicable). Writes `.kiro/specs/<slug>/requirements.md` and updates
`spec.json` to `phase: requirements-generated`. **Local-only** — no `gh`, no MCP.

## Gate (hard rule — check first)

**REFUSE to proceed** unless `.kiro/specs/<slug>/spec.json` exists with `phase` ≥ `initialized`.

If `spec.json` is missing or `phase` is absent:

> **Error:** No spec found for this feature. Run `/uneri-skills:sdd-init <UC-ID>` first to create the spec
> seed, then re-run `/uneri-skills:sdd-requirements`.

Do not generate any requirements, do not write any file, and do not continue until this condition
is satisfied.

**Re-open exception (requirements were wrong).** When the spec already advanced past
`requirements-generated` (`phase` is `clarified` / `design-generated` / `tasks-generated` /
`implemented`) and a later review finds that the **acceptance criteria themselves** were wrong or
incomplete — not merely a clarification detail (use `/uneri-skills:sdd-clarify`'s re-open for that) and not
the design or implementation — re-running this skill **is allowed**. This is the most upstream
re-open: everything built on top of the old requirements (clarifications, design, tasks) is now
stale, so re-opening resets it all:

- Regenerate/update `requirements.md`.
- Set `phase: "requirements-generated"` (regressing past `clarified` if the spec was further along).
- Set `approvals.requirements.generated: true`, `approvals.requirements.approved: false` (needs
  re-approval — do not carry forward the old approval).
- Reset `approvals.design.generated: false`, `approvals.design.approved: false`.
- Reset `approvals.tasks.generated: false`, `approvals.tasks.approved: false`.
- Reset `ready_for_implementation: false`.
- Tell the user the spec must go through `/uneri-skills:sdd-clarify` → `/uneri-skills:sdd-design` →
  `/uneri-skills:sdd-tasks` again.

If instead the **UC's goal itself changed** (see `uneri-skills:udd-authoring` § Re-work vs goal change), do
**not** reuse this spec — spin a new UC + new spec.

## Language

Read language from `spec.json` → `language`. If absent, fall back to `.uneri.json` → `lang`, then
default `en`. This skill takes **no `--lang`** — language is already resolved and stored in
`spec.json` by `/uneri-skills:sdd-init`.

## Steps

1. **Read `spec.json`** from `.kiro/specs/<slug>/`. Extract `traces_uc`, `language`, and confirm
   `phase >= initialized` (gate above). If `traces_uc` is missing or malformed, error clearly and
   tell the user to check `spec.json` or re-run `/uneri-skills:sdd-init`.

2. **Read the UC** — resolve the layout from `.uneri.json` → `layout` (`single-context` ⇒ repo-root
   `.kiro/uneri/use-cases.md`; `multi-context` ⇒ the per-context `services/<ctx>/.kiro/uneri/use-cases.md`); if the
   field is absent, detect it from the repo layout. Open that file and find the entry for `traces_uc`. Extract the UC name, `actor`, `realizes`, `aggregates`, and
   any documented scenarios (preconditions / postconditions / notes). Read related sections of
   `domain-model.md` and `actors.md` as needed for the UC's aggregates and actor.

3. **Seed requirements** — derive EARS acceptance criteria (`When … the … shall` / `If … then …`)
   from the UC scenarios. At minimum generate:

   - **One sunny-day requirement** — the primary success scenario: the actor completes the UC goal.
   - **Rainy-day requirements** covering every applicable category below (include all that apply;
     skip only with an explicit note if a category genuinely cannot apply):

     | Category                   | Trigger to look for                                                                             |
     | -------------------------- | ----------------------------------------------------------------------------------------------- |
     | Validation failure         | Any input the UC accepts (always applicable)                                                    |
     | Authorization denied       | Any actor access gate or permission check in the UC                                             |
     | Conflict / concurrent edit | Any state mutation on an aggregate (always applicable if `aggregates` is set)                   |
     | External-system failure    | Any `realizes: [EVT-…]` or downstream integration the UC touches                                |
     | AI-output uncertainty      | The UC uses a component whose output varies for the same input (an LLM, a classifier, a ranker) |

   **AI-output uncertainty** applies only when the UC uses a component whose output varies for the same
   input. Write criteria for: what the system does when the component is not confident (hand the decision to
   a person, or decline to answer); never answering from a guess when no source supports the answer; how an
   input outside the expected range is handled; what is recorded about each decision; and which changes
   (model, prompt, data) require the behaviour to be evaluated again. If the UC has no such component, leave
   the category out and say so in one line.

   **External obligations.** "Comply with `<law or guideline>`" is not an acceptance criterion, because it
   cannot be checked. Turn it into criteria that name the duty, the prohibition, the condition, the record to
   keep, or the check, each tied to something the system does. If the clause is not known from the UC,
   steering or the user, do not guess one: keep the requirement's other criteria and leave out only the unknown
   clause (never drop the whole requirement; Step 4 needs criteria for every requirement). Record each such gap
   as an HTML comment line inside the `## Clarifications` section, in the form
   `<!-- open for sdd-clarify: <the quoted fragment or topic> — <what is missing> -->`, and mention it in your
   reply too, so `/uneri-skills:sdd-clarify` can pick it up.

   **Check every criterion before writing the file.** Each one must be:

   - **Measurable** — it states something that can be observed or checked. Replace "fast", "easy to use",
     "appropriately", "as needed" with an observable outcome. If the UC gives no value, do not invent a
     number: leave the value out (for example, state the observable outcome, "the result list is shown", and
     record the time limit as an open point). Record each such gap as an HTML comment line inside the
     `## Clarifications` section, in the form
     `<!-- open for sdd-clarify: <the quoted fragment or topic> — <what is missing> -->`, and mention it in your
     reply too, so `/uneri-skills:sdd-clarify` can pick it up.
   - **Single** — one matter per criterion; split "does A and B".
   - **Unambiguous** — the subject is named and there is one reading.
   - **Consistent** — it does not contradict another criterion.

4. **Structure as Kiro requirements** — use the cc-sdd/Kiro **canonical shape** the ecosystem parser
   expects (requirement heading `#{2,3}\s+Requirement\s+N[:：]?` + a
   `#### Acceptance Criteria` numbered EARS list). Group related scenarios under
   `### Requirement N: <Capability>` headings (**numeric ID required** — never `Requirement A`), add
   an `**Objective:** As a <role>, I want <capability>, so that <benefit>` line, then list the EARS
   clauses as a numbered `#### Acceptance Criteria` list (`1.`, `2.`, …). Tasks (in
   `/uneri-skills:sdd-tasks`) reference them as `<N>.<M>` (Requirement N, Acceptance Criterion M); the
   derived trace ID is `AC-<CTX>-<UC number>.<N>.<M>`. **Do not** use `## N. <Capability>` capability
   headings or inline `N.M` lines — the parser will not recognize them.

5. **Append `## Clarifications`** — a section with a placeholder comment (plus any `open for sdd-clarify`
   comment lines from Step 3) and no Q/A entries, populated later by `/uneri-skills:sdd-clarify`.

6. **Write `requirements.md`** at `.kiro/specs/<slug>/requirements.md` using the skeleton below.

7. **Update `spec.json`**:
   - Set `phase: "requirements-generated"`.
   - Set `approvals.requirements.generated: true`.
   - Refresh `updated_at` to the current ISO-8601 timestamp.
   - **On a re-open** (see Gate above): also set `approvals.requirements.approved: false` and reset
     `approvals.design.*`, `approvals.tasks.*`, and `ready_for_implementation: false`.

8. **Ask the user to review** the generated `requirements.md`. When they confirm the requirements
   are correct:
   - Set `approvals.requirements.approved: true` in `spec.json`.
   - Refresh `updated_at`.
   - Point to the next step: `/uneri-skills:sdd-clarify`.

## The `requirements.md` it writes

Write this file at `.kiro/specs/<slug>/requirements.md` in the **cc-sdd/Kiro canonical shape**
(matches `.kiro/settings/templates/specs/requirements.md`). Substitute
real values for `<feature>`, `<CTX>`, `NNN`, and the EARS clauses. Localize headings and prose to
`spec.json.language`; keep the EARS keywords (`When` / `If … then` / `While` / `Where` /
`… shall`) in their canonical English form — never translate them (localize only the surrounding
text):

```markdown
# Requirements: <feature> (traces UC-<CTX>-NNN)

## Requirements

### Requirement 1: <Capability>

**Objective:** As a <actor>, I want <capability>, so that <benefit>

#### Acceptance Criteria

1. When <actor> <trigger>, the <system> shall <outcome>.
2. If <validation error condition>, then the <system> shall <error handling>.
3. If <actor is not authorized>, then the <system> shall <deny access handling>.
4. If <concurrent edit conflict>, then the <system> shall <conflict handling>.
5. If <external system is unavailable>, then the <system> shall <failure handling>.

## Clarifications

<!-- filled by /uneri-skills:sdd-clarify -->
<!-- open for sdd-clarify: <quoted fragment or topic> — <what is missing> -->  (only when a gap was left out)
```

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                                 | ✅ Correct                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running before `/uneri-skills:sdd-init`                                    | Hard-refuse; gate checks `spec.json` exists with `phase >= initialized` before any work                                                                                                                          |
| Skipping rainy-day scenarios                                               | Generate **all applicable** rainy-day categories (validation, auth, conflict, external, and AI-output uncertainty where the UC has such a component) — not just happy path                                       |
| Using `## N. <Capability>` headings or inline `N.M` EARS lines             | Kiro canonical shape only: `### Requirement N: title` + `**Objective:**` + `#### Acceptance Criteria` numbered list — the parser matches the literal `Requirement N` and counts `#### Acceptance Criteria` items |
| Alphabetic requirement IDs (`Requirement A`)                               | Numeric ID required (`Requirement 1`, `Requirement 2`, …)                                                                                                                                                        |
| Putting EARS clauses outside `#### Acceptance Criteria`                    | AC must be a numbered list (`1.`, `2.`, …) under `#### Acceptance Criteria`; that is what the parser counts                                                                                                      |
| Omitting `## Clarifications`                                               | Always append the empty section — `/uneri-skills:sdd-clarify` populates it next                                                                                                                                  |
| Forgetting to update `spec.json`                                           | Set `phase`, `approvals.requirements.generated`, and `updated_at` after writing the file                                                                                                                         |
| Translating EARS keywords (`When`/`If … then`/`While`/`Where`/`shall`)     | These are canonical EARS keywords — keep them verbatim in every language                                                                                                                                         |
| Setting `approvals.requirements.approved` without user review              | Write the file and update `generated`; wait for explicit user confirmation before setting `approved`                                                                                                             |
| Re-opening without resetting downstream approvals                          | Requirements are the most upstream artifact — a re-open must reset `approvals.design.*`/`approvals.tasks.*`/`ready_for_implementation`, not just `requirements`                                                  |
| Treating a clarification-only fix as a requirements re-open                | If only a clarification answer was wrong, use `/uneri-skills:sdd-clarify`'s own re-open instead — don't rewrite `requirements.md` for that                                                                       |
| Unmeasured wording in a criterion ("fast", "easy to use", "appropriately") | An observable outcome with a value taken from the UC; if the UC gives none, leave the value out and record it as an `open for sdd-clarify` comment — never invent a number                                       |
| "Comply with `<law or guideline>`" as a criterion                          | One criterion per duty, prohibition, condition, record or check; if the clause is unknown, leave out only that clause and record the gap as an `open for sdd-clarify` comment instead of guessing                |
| AI-output criteria on a UC with no varying-output component                | Add them only when the UC uses such a component; otherwise one line saying the category does not apply                                                                                                           |
