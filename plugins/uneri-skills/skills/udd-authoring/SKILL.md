---
name: udd-authoring
description: Conventions for authoring uneri use cases — the UC-ID system, notation, and granularity rules that keep `.kiro/uneri/use-cases.md` consistent. Auto-loads whenever use cases are being written or edited (editing `use-cases.md`, adding/renaming/retiring a UC, discussing UC-IDs, actors, realizes/aggregates, or "ユースケースを書く/直す"). Knowledge skill — not a command, takes no arguments; it supplies the shared rules that uneri-skills:udd-init / uneri-skills:udd-add / uneri-skills:udd-validate / uneri-skills:sdd-init build on.
---

# uneri-skills:udd-authoring — UC conventions (knowledge skill)

Background knowledge for writing/editing uneri use cases. **This is not a command** — it auto-activates to keep any
UC edit (via a skill *or* by hand) consistent. It carries the portable conventions; the `uc-*` commands rely on it.
Upstream domain lives in `.kiro/uneri/domain-model.md` / `actors.md` / `glossary.md`.

## What a use case is (granularity)

- **UC = 🌊 user-goal level × 1 spec**: one actor accomplishing one goal in one sitting, sized to a single
  `requirements→design→tasks`. Principle: `1 UC = 1 spec = 1 GitHub Issue`.
- **Name** = an actor's goal, a verb phrase (1 UC = 1 actor × 1 goal).
- **Too big (☁️ epic)** → split into multiple user-goal UCs. **Too small (🐟 sub-function** like "log in") → fold into
  the owning goal, don't make it a UC.
- **Actor separation**: same feature, different actor ⇒ different UC (e.g. *send* vs *accept* an invitation).
- **UC is functional only.** Both bands are functional goals (users / developers). **Non-functional requirements are
  NOT UCs** — global NFRs → `tech.md`/`structure.md`; per-UC NFRs → that spec's `requirements.md`.

## UC-ID convention

- Format `UC-<CTX>-NNN` — `<CTX>` = bounded-context code (one per file); `NNN` = **per-context** 3-digit zero-padded serial.
- Number bands: **001–099 functional** (user-facing) / **100– operational** (developer-facing: CI/CD, dev env, monitoring, infra).
- IDs are **immutable and never reused**; retired UCs **keep their number** (no back-filling gaps).
- **Auto-numbering** = `max(existing in this CTX+band) + 1`. Never renumber existing UCs.
- **Order in the file** is not part of the ID. Until the file is arranged it follows the numbers; after
  `uneri-skills:udd-arrange` it follows the user's journey, with `<!-- journey: <stage> -->` markers. A number says when
  the UC was added, never where it sits.

## Fields per UC

- **Required**: `actor`.
  - `actor` — the **English identifier from `actors.md`** (controlled vocabulary; multi-actor with `/`). Register a
    new actor in `actors.md` (localized label ＋ English identifier) before using it.
- A `size:` line, if another tool wrote one, is ignored: uneri counts use cases, it does not weigh them.
- **Optional**: `realizes: [EVT-<CTX>-…]` (domain events the UC brings about — omit for read-model/query UCs) /
  `aggregates: [AGG-<CTX>-…]` (aggregates it acts on), both defined in `domain-model.md`; plus `precondition` and
  `postcondition` (a short factual statement of what must hold before/after — who may call it, what state it
  requires; one or two lines, not a scenario) and `scope` (what the UC does and does not cover, e.g. which
  fields/operations are in vs. out of this UC's boundary). Like `actor`/`realizes`/`aggregates`, these are
  **canonical English field keys, kept verbatim regardless of the project's output language** — only the value text
  is localized.
- **`notes`** (optional): a **pointer**, not a design section — one or two lines flagging that design is pending and
  naming the design decision to consult, e.g. "design pending, see the design doc, decision 2". **Do not** put API paths, DB
  columns/tables, or worked-out design decisions here — that content belongs in the UC's spec `design.md` once
  `/uneri-skills:sdd-design` runs. A `notes` field that reads like a design section is a sign the UC is ready for
  `/uneri-skills:sdd-init` rather than needing more steering-level detail.
- **Optional lifecycle marker**: `deprecated: <YYYY-MM-DD> <reason>` marks a UC the team **no longer pursues**
  (do **not** delete it into a numbering gap — leave the entry in place, in its current position). When a goal change
  (see § Re-work vs goal change) **replaced** it with a new UC, also add `superseded_by: UC-<CTX>-NNN`. Keep
  `realizes`/`aggregates` as history.
  A `deprecated` UC is **not counted** in progress (implemented / active use cases): leaving a goal that is no longer pursued in the denominator would lower the rate for no reason.
  A `deprecated` UC needs no spec (`uneri-skills:udd-validate` / `uneri-skills:sdd-trace` treat it as intentionally un-specced).
  This is an **upstream UC-lifecycle declaration** — distinct from an implementation being rejected (a dev-time
  fact that one implementation was not adopted; that lives in `domain-model.md`, not here).
- **Never write** `Status` / `Spec` / `Issue` — those are derived from specs and tasks. This file holds upstream
  declarations only; no double maintenance.
- **No scenarios in `use-cases.md`.** Sunny-day / rainy-day scenarios (basic & alternate courses) belong to each UC's
  spec `requirements.md` (EARS), written at spec time — `/uneri-skills:sdd-requirements` (within the `/uneri-skills:sdd-*` flow
  started by `/uneri-skills:sdd-init`) seeds them from the UC's scenarios. Writing scenarios here would duplicate the spec
  and bloat steering.

## Editing existing UCs (no dedicated command)

Editing `use-cases.md` is plain-Markdown editing guided by these conventions, then verified by `uneri-skills:udd-validate`
(duplicates / gaps / band / fields / actor registration / stray generated fields). Rules:

- **Rename / change `actor`/`realizes`/`aggregates`**: fine — but **keep the ID unchanged**.
- **Retire / deprecate a UC**: keep its number (immutable, never reused) and **keep the entry in place** — mark it with
  `deprecated: <YYYY-MM-DD> <reason>` rather than deleting it into a gap, so "no longer pursued" is legible, not silent.
  **A UC that nothing refers to may be deleted instead:** no spec has it as `traces_uc`, and no GitHub label, Issue or PR carries its ID
  (the label is created with the first Issue or PR, so no label means no reference; check with `gh label list`). Never reuse its number:
  it stays a gap, because the ID may still appear in notes and commit messages. If a referenced UC is deleted by mistake,
  `uneri-skills:sdd-trace` reports its spec as an orphan.
- **Split / merge**: introduce new IDs for new goals; deprecated originals keep their numbers (add `superseded_by` on them).
- **Re-work vs goal change**: the test is whether the **UC's declared goal/`scope`** (the actor-goal pairing and
  boundary recorded in `use-cases.md`) changed — **not** whether a specific acceptance criterion in the spec's
  `requirements.md` changed. Acceptance criteria are expected to evolve (edge cases added, wording tightened,
  a correction from review) **without** touching the UC's goal; that is normal living-document maintenance —
  **keep the same UC** (reopen the same ID; still `1 UC = 1 Issue`, no new Issue) and revise `requirements.md` /
  `design.md` / `tasks.md` in place (`sdd-clarify` / `sdd-requirements` re-run, `sdd-design`'s re-open exception).
  Only when the goal itself changes — a different actor, a fundamentally different objective, or a change that
  cannot be expressed without rewriting the UC's own `scope` in `use-cases.md` — is it a different UC →
  **assign a new ID and mark the old UC `deprecated` + `superseded_by: <new id>`** (per deprecate/split above).
  Treating every acceptance-criteria edit as a new UC would re-introduce delta/archival churn that this workflow
  deliberately avoids — specs are **living documents**, edited in place, not forked on every requirement
  refinement. This same test governs a **review-driven redesign**: an acceptance-review mismatch that only needs
  re-implementation or a requirements/design correction keeps the UC; one whose goal changes spawns a new UC.

## File shape

The file's **frontmatter declares its single bounded context** — `context: <CTX>` (self-identification;
must match the UC-ID headings below, enforced by `uneri-skills:udd-validate`). This is how each file is tied to a
context in Pattern A (multi-context: one file per context), where `.uneri.json` cannot carry per-file codes.

```markdown
---
inclusion: manual
context: <CTX>
---

# <title>

### UC-<CTX>-NNN <name — an actor's goal>

- actor: <English identifier(s) from actors.md>
- realizes: [EVT-<CTX>-NNN] <!-- optional; omit for read-model UCs -->
- aggregates: [AGG-<CTX>-NNN] <!-- optional -->
- precondition: <one line — what must hold before> <!-- optional -->
- postcondition: <one line — what must hold after> <!-- optional -->
- scope: <one line — what's in/out of this UC's boundary> <!-- optional -->
- notes: <one-line pointer to pending design + ADR/decision id, not the design itself> <!-- optional -->
- deprecated: <YYYY-MM-DD> <reason> <!-- optional; when no longer pursued -->
- superseded_by: UC-<CTX>-NNN <!-- optional; only when replaced by a new UC (WHAT pivot) -->
```

Two sections only: **functional** (001–099) and **operational** (100–). Output in the project's language
(`.uneri.json` `lang`, set by `/uneri-skills:udd-init`); keep canonical tokens (`inclusion: manual`, `context:`, `UC-`/`EVT-`/`AGG-`, field keys) verbatim.

## Common mistakes

| ❌                                                                                | ✅                                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1 UC = 1 endpoint / story-sized                                                   | 🌊 user-goal × 1 spec                                                                                                          |
| NFR as a UC                                                                       | NFRs → `tech.md`/`structure.md` or spec `requirements.md`                                                                      |
| Renumbering / reusing retired IDs                                                 | IDs immutable; append `max+1`; gaps stay                                                                                       |
| Deleting a dropped UC into a gap                                                  | Keep the entry in place; mark `deprecated:` (+ `superseded_by:` when replaced)                                                 |
| Treating `deprecated` (UC) same as a rejected implementation                      | `deprecated` = upstream "goal no longer pursued"; a rejected implementation is a dev fact                                      |
| Free-text / localized `actor`                                                     | English identifier registered in `actors.md`                                                                                   |
| Writing `Status`/`Spec`/`Issue`                                                   | Derived from specs and tasks                                                                                                   |
| Flat list                                                                         | Split functional (001–099) / operational (100–)                                                                                |
| Scenario steps (sunny/rainy) in `use-cases.md`                                    | Scenarios → that UC's spec `requirements.md` (EARS) via `/uneri-skills:sdd-requirements` (start with `/uneri-skills:sdd-init`) |
| `notes` grown into a design section (API paths, DB columns, worked-out decisions) | Keep it a one-line pointer; move the content to spec `design.md` via `/uneri-skills:sdd-design`                                |
| Localized field key (`事前条件:`, `対象:`, `備考:`, etc.)                         | Field keys stay canonical English (`precondition`/`scope`/`notes`, like `actor`); only the value is localized                  |
