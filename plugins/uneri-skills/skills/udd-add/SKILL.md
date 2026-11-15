---
name: udd-add
description: Use when adding a new use case to an existing `.kiro/uneri/use-cases.md` — appends one `UC-{CTX}-NNN` entry with auto-numbering, a validated `actor`, and optional `realizes`/`aggregates`. Triggers include "add a use case", "新しいユースケースを追加", "UCを追記", or after uneri-skills:udd-init when the list needs entries. NOT for creating the file (use uneri-skills:udd-init) or for non-functional requirements (those go to steering/spec). Output language follows `.uneri.json`.
---

# uneri-skills:udd-add — append one use case

## Overview

Adds **one** use case to an existing `use-cases.md` at **user-goal level × 1 spec** granularity,
auto-numbering with a stable, immutable `UC-<CTX>-NNN` id. It fills the required `actor`,
validates `actor` against `actors.md`, and offers upstream links (`realizes` / `aggregates`) from `domain-model.md`.
**Output is written in the project's configured language** (see Language). One invocation = one UC.

**REQUIRED background:** the `uneri-skills:udd-authoring` skill holds the full UC-ID / notation conventions
and the granularity rules. Add UCs, then verify with `uneri-skills:udd-validate`, start its spec with `uneri-skills:sdd-init`.

## When to use

- An existing `use-cases.md` needs a new use case added.
- **NOT** when the file does not exist yet → run `uneri-skills:udd-init` first (never create it here).
- **NOT** for a non-functional requirement (performance, security, rate-limit, availability, i18n) →
  those are **not use cases**; put global NFRs in `tech.md`/`structure.md`, per-UC NFRs in the spec's `requirements.md`.

## Language (uneri config)

The output language comes from **`.uneri.json`** (`lang`), set once by `/uneri-skills:udd-init`. uneri-skills:udd-add **reads** it and takes no `--lang`.
Localize the UC name/prose; keep canonical tokens
(`UC-<CTX>-NNN`, field keys `actor`/`realizes`/`aggregates`, `EVT-`/`AGG-` ids) verbatim.

## Steps

1. **Locate the target file.** Resolve the layout from `.uneri.json` → `layout` (`single-context` ⇒ Pattern B,
   `multi-context` ⇒ Pattern A); if the field is absent, detect it (`services/<ctx>/` tree ⇒ A, single root `.kiro/` ⇒ B).
   Either way cross-check against the actual layout and, on mismatch, warn and confirm before proceeding.
   Then open repo-root `.kiro/uneri/use-cases.md` (Pattern B); or `services/<ctx>/.kiro/uneri/use-cases.md`
   (Pattern A — pick the context the UC belongs to). **If it does not exist, stop and point to `uneri-skills:udd-init`** (do not create it).
2. **Read it** to get the `<CTX>` code (from the frontmatter `context:` — authoritative; cross-check it matches the
   UC-ID headings), all existing UC ids, and the two sections (functional / operational).
3. **Frame the request as an actor-goal at 🌊 user-goal level × 1 spec** (see `uneri-skills:udd-authoring`):
   - **Epic-sized** (multiple goals / would need >1 design)? → propose splitting into multiple UCs; add them one at a time.
   - **Sub-function** ("log in", "validate")? → fold into the owning goal; do not create a standalone UC.
   - **A non-functional requirement?** → **not a UC**; redirect to `tech.md`/`structure.md` or the spec's `requirements.md`.
4. **Classify the band** (one CTX per file):
   - **001–099 functional** — a user-facing goal (actor is a user / external client).
   - **100– operational** — a developer-facing goal (CI/CD, dev env, monitoring, infra, ops).
5. **Auto-number.** Within this `<CTX>` and band, assign `max(existing) + 1`, 3-digit zero-padded.
   IDs are **immutable and never reused**; **never back-fill gaps** (retired numbers stay retired).
6. **Fill the required fields:**
   - `actor`: use the **English identifier from `actors.md`** (controlled vocabulary; multi-actor with `/`).
     If the needed actor is not in the catalog, **register it in `actors.md` first** (localized label + English identifier), then use it.
7. **Offer upstream links** (optional) from `domain-model.md`:
   - `realizes: [EVT-<CTX>-…]` — the domain event(s) this UC brings about (omit for pure Read-Model/query UCs).
   - `aggregates: [AGG-<CTX>-…]` — the aggregate(s) it acts on.
   - If the matching command/event is **not yet in `domain-model.md`**, note the gap (or add it there) so the model stays complete.
8. **Write the UC block** (below) into the correct section, in the resolved language. With no `<!-- journey: … -->` markers in the file, keep numeric
   order within the band. With markers (see `uneri-skills:udd-arrange`), put it at the end of the stage it fits, and
   ask when two stages fit; never reorder the others.
   Do **not** write `Status`/`Spec`/`Issue` — they are derived from specs and tasks, never written here.
9. Tell the user to run **`/uneri-skills:udd-validate`** to verify (id duplicates/gaps, band, required fields, `actor` registration, single-CTX).

## The block it writes

Canonical reference — localize the UC name/heading prose to the resolved language; keep tokens verbatim:

```markdown
### UC-<CTX>-NNN <name — an actor's goal>

- actor: <English identifier(s) from actors.md, e.g. `PM` or `Owner / PM`>
- realizes: [EVT-<CTX>-NNN] <!-- optional; omit for read-model/query UCs -->
- aggregates: [AGG-<CTX>-NNN] <!-- optional -->
```

## Common mistakes (do NOT repeat)

| ❌ Mistake                                            | ✅ Correct                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1 UC = 1 API endpoint / story-sized                   | 🌊 user-goal level × 1 spec; bundle endpoints into one goal                         |
| Creating a UC for an NFR (rate-limit, perf, security) | NFRs are **not UCs** → `tech.md`/`structure.md` or spec `requirements.md`           |
| Back-filling a gap / reusing a retired number         | IDs immutable; append `max+1` only; gaps stay                                       |
| Free-text / localized `actor`                         | Use the **English identifier registered in `actors.md`**; register first if missing |
| Guessing the band                                     | 001–099 = user-facing / 100– = developer-facing                                     |
| One giant `L` UC spanning several goals               | Split into multiple user-goal UCs                                                   |
| Writing `Status`/`Spec`/`Issue`                       | Derived from specs and tasks; never hand-written here                               |
| Creating the file if missing                          | Stop; run `uneri-skills:udd-init` first                                             |
| Hardcoding one language                               | Follow `.uneri.json` `lang` (see Language)                                          |

## Note on invocation

Invoked as `/uneri-skills:udd-add` — the `uneri-skills:` namespace is supplied by the plugin. Language comes from `.uneri.json` (set by `/uneri-skills:udd-init`); this skill takes no `--lang`.
