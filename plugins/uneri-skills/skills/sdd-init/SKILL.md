---
name: sdd-init
description: Use when turning one use case (`UC-{CTX}-NNN`) from `.kiro/uneri/use-cases.md` into a spec — reads the UC, creates `.kiro/specs/{NNN-slug}/`, and writes `spec.json` seeded with `traces_uc`. Checks first whether a spec already traces this UC and hands off to the right next step instead of creating a duplicate. First step of the /uneri-skills:sdd-* planning workflow (requirements → clarify → design → tasks). Triggers include "turn UC into a spec", "UCをspec化", "start a spec for UC-…", "spec-init".
---

# uneri-skills:sdd-init — seed a spec from one UC

## Overview

Turns **one UC → one spec seed**: reads `UC-<CTX>-NNN` from `.kiro/uneri/use-cases.md`,
gathers upstream context on demand, computes a UC-number-matched slug, creates
`.kiro/specs/<NNN-slug>/`, and writes `spec.json` with `traces_uc` set and
`phase: initialized`. It does **not** generate requirements — that is `/uneri-skills:sdd-requirements`.
**Local-only** — no `gh`, no MCP. Output language follows `.uneri.json` (see Language). One
invocation = one UC → one spec seed — **but first checks whether a spec already traces this UC**
(Step 0) and hands off to the appropriate next skill instead of creating a second spec for the
same UC. A `.kiro/specs/` directory is a **living planning artifact**, not a one-shot snapshot:
the default assumption is that revisiting a UC means resuming its existing spec, not starting over.

## When to use

- A UC exists in `.kiro/uneri/use-cases.md` and you want to start its spec.
- **NOT** when a spec already traces this UC and the UC's goal/`scope` hasn't changed — resume the
  existing spec instead, even if acceptance criteria were refined or corrected (this skill detects
  that case itself and hands off; see Step 0).
- **NOT** for generating requirements, design, or tasks — those are the subsequent `sdd-*`
  skills.
- **NOT** for creating GitHub Issues — that is `uneri-skills:issue-upsert` (uses `gh`).

## Language

The resolved language is written to `spec.json.language`. Read it from `.uneri.json` → `lang` (set once by `/uneri-skills:udd-init`; this skill takes no `--lang`), else from the language of existing specs' `spec.json`, else default **`en`**.

If this skill runs **standalone** and `.uneri.json` is **missing**, create it as a fallback: `{ "agent": "claude-code-skills", "lang": "<resolved>" }`. If it **exists**, read it and **do not overwrite** it.

## Steps

0. **Check for an existing spec first.** Scan every `.kiro/specs/*/spec.json` for an entry whose
   `traces_uc` equals this UC id.
   - **None found** → proceed to Step 1.
   - **Found** → do **not** create a second spec for the same UC. Decide which case this is:
     - **The UC's goal/`scope` itself has genuinely changed** (a different actor, a fundamentally
       different objective — not merely a refined or corrected acceptance criterion, which is
       normal living-document maintenance on the same spec) — per `uneri-skills:udd-authoring` §
       Re-work vs goal change, this needs a **new UC**, not a second spec on the old one. Stop
       here and redirect to `uneri-skills:udd-add` to create the new UC (marking the old one
       `deprecated` + `superseded_by`), then re-run `uneri-skills:sdd-init` on the new UC id.
     - **Otherwise** (re-architecture, a correction, refined acceptance criteria, more detail, or
       simply resuming work) — **reuse the existing spec.** Report its path, `phase`, and
       `traces_uc`, and hand off to the skill matching its `phase` instead of writing anything:

       | `phase`                  | Next skill                                                                                                 |
       | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
       | `initialized`            | `/uneri-skills:sdd-requirements`                                                                           |
       | `requirements-generated` | `/uneri-skills:sdd-clarify`                                                                                |
       | `clarified`              | `/uneri-skills:sdd-design`                                                                                 |
       | `design-generated`       | `/uneri-skills:sdd-tasks`                                                                                  |
       | `tasks-generated`        | `/uneri-skills:sdd-impl` (or `/uneri-skills:sdd-validate-impl` if already implemented)                     |
       | `implemented`            | Already implemented; re-enter only via `sdd-design`'s re-open exception if a review found the design wrong |

       Do **not** touch that spec's files, `phase`, or `approvals` — resuming/regenerating an
       interior step is that step's own skill's job (each already handles re-runs as a living
       document), not this one's. When the handoff target is `/uneri-skills:sdd-impl`, continue into it only if the
       user asked to carry the spec through to implementation (an explicit request to implement — e.g. "implement it", "実装まで進めて", "最後まで" — not merely "generate the tasks" or "get this going"); for a plain "init / start a spec"
       request, report the existing spec and name `/uneri-skills:sdd-impl` as the next step — an init
       request is not a request to write code and make commits.
1. **Read the UC** `UC-<CTX>-NNN` from `.kiro/uneri/use-cases.md`: name, `actor`,
   `realizes`, `aggregates`. If the UC is missing or malformed, **error clearly** and point to
   `/uneri-skills:udd-add` (to add the UC) or `/uneri-skills:udd-validate` (to fix a malformed one).
2. **Gather context on demand** (read only what this UC needs — nothing is always-loaded):
   - `domain-model.md` → the aggregate(s)/event(s)/state/policies behind this UC's
     `aggregates` / `realizes`.
   - `glossary.md` → the terms/enums this UC uses.
   - `actors.md` → the actor(s).
   - **Relevant project design docs / steering** the UC touches — **reference, do not
     duplicate** (whatever steering or design docs the project has — e.g. an aggregate → its
     section in the data design, a UC → its endpoints in the API design). Collect pointers to
     the relevant sections.
3. **Compute the slug** `<NNN>-<kebab-name>` so the number **matches the UC**
   (e.g. `UC-SHP-008` → `008-order-tracking`). If a spec directory whose name starts with that
   `NNN` already exists, **warn** (possible collision) and stop unless the user confirms. (This is
   a filesystem-level safety net independent of Step 0's `traces_uc` check — e.g. a stray or
   hand-renamed directory.)
4. **Create** `.kiro/specs/<slug>/` and **write `spec.json`** exactly in the canonical shape
   (see below), with `traces_uc` = the UC id, `phase: initialized`, all `approvals` false, and
   `language` = the resolved language. Do **not** create `requirements.md`, `design.md`, or
   `tasks.md` — this skill writes only `spec.json`.
5. **Hand off** — tell the user to run `/uneri-skills:sdd-requirements` next to generate EARS
   requirements seeded from the UC's scenarios.

## The `spec.json` it writes

Write this file verbatim at `.kiro/specs/<NNN-slug>/spec.json`, substituting the real values for
`feature_name` (**the full slug `<NNN>-<kebab-name>` — identical to the spec directory name, NNN
included**), `created_at` / `updated_at` (current ISO-8601 timestamp), `language` (resolved
language), and `traces_uc` (the UC id):

```json
{
  "feature_name": "008-order-tracking",
  "created_at": "<ISO-8601>",
  "updated_at": "<ISO-8601>",
  "language": "ja",
  "traces_uc": "UC-SHP-008",
  "phase": "initialized",
  "approvals": {
    "requirements": { "generated": false, "approved": false },
    "design": { "generated": false, "approved": false },
    "tasks": { "generated": false, "approved": false }
  },
  "ready_for_implementation": false
}
```

`phase` ∈ `initialized | requirements-generated | clarified | design-generated | tasks-generated | implemented`.
(`implemented` is written by `/uneri-skills:sdd-validate-impl` on a GO verdict, not by this skill.)
`traces_uc` is a **first-class uneri field** — it is the authoritative machine-readable link
between this spec and its originating UC. The `.kiro/specs/` layout stays compatible with the
Kiro/cc-sdd ecosystem; `traces_uc` is additive and ignored by tools that do not read it.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                   | ✅ Correct                                                                                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generating requirements, design, or tasks here               | This skill writes **`spec.json` only** — requirements come from `/uneri-skills:sdd-requirements`                                                      |
| Writing a grep `traces:` marker                              | Use the `traces_uc` field in `spec.json` only; there is no grep marker                                                                                |
| Spec directory number ≠ UC number                            | Slug `<NNN>-…` must match `UC-<CTX>-NNN` (e.g. `UC-SHP-008` → `008-order-tracking`)                                                                   |
| `feature_name` without the `NNN` prefix                      | `feature_name` **equals the directory name** incl. NNN (e.g. dir `008-order-tracking` → `feature_name: "008-order-tracking"`, NOT `"order-tracking"`) |
| Overwriting an existing spec                                 | If `.kiro/specs/<NNN>-*/` already exists, **warn and stop** unless the user explicitly confirms                                                       |
| Skipping the collision check                                 | Always scan `.kiro/specs/` for a directory starting with the same `NNN` before creating                                                               |
| Creating a second spec for a UC that already has one         | Step 0: scan all `spec.json` for `traces_uc` first; reuse and hand off by `phase`, or redirect to a new UC if the WHAT changed                        |
| Treating `.kiro/specs/` as disposable, always starting fresh | A spec is a **living planning artifact**; resuming an existing one is the default, not the exception                                                  |
| Hardcoding one language / ignoring the project's language    | Resolve from `.uneri.json` `lang` (see Language); default `en`; write to `spec.json.language`                                                         |
| Delegating to cc-sdd / invoking `/kiro-spec-init`            | uneri-skills:sdd-init writes `spec.json` directly — no delegation to cc-sdd in this workflow                                                          |
| Using `gh` / MCP                                             | uneri-skills:sdd-init is local-only; `gh` belongs to `uneri-skills:issue-upsert`                                                                      |
