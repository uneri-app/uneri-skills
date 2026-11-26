---
name: udd-init
description: Use as the entry point to start uneri's use-case-driven development in a repo — a guided bootstrap that sets `.uneri.json` (language via `--lang`), runs a light EventStorming to produce `domain-model.md`/`actors.md`/`glossary.md`, scaffolds `use-cases.md` (skeleton + UC-ID conventions), and routes into uneri-skills:udd-add. Triggers include "start uneri", "kick off UC-driven development", "start tracking use cases", "create/set up use-cases.md". Takes `[CTX] [--lang {code}]`.
---

# uneri-skills:udd-init — entry point: language, domain discovery & `use-cases.md`

## Overview

The **front door** for uneri. A guided orchestrator that takes a repo from nothing to a first use case:
sets the project language (`.uneri.json`), discovers the domain (light EventStorming → `domain-model.md` /
`actors.md` / `glossary.md`), scaffolds the **empty, convention-correct** `use-cases.md` (skeleton + UC-ID
conventions), and hands into the `uneri-skills:udd-add` ⇄ `uneri-skills:udd-validate` loop. **Local-only** — no `gh` or MCP.
**Idempotent:** skips/augments what already exists, never overwrites. **Output is written in the project's configured
language** (see Language).

UCs are added later by `uneri-skills:udd-add`, turned into specs by `uneri-skills:sdd-init`. The domain docs this skill produces
are what UCs reference via `realizes: [EVT-…]` / `aggregates: [AGG-…]` — so discovering them here is what gives UCs
something to point at.

**REQUIRED background:** the `uneri-skills:udd-authoring` skill holds the full UC-ID / notation conventions
and the granularity rules.

## When to use

- A repo wants to adopt uneri's UC-driven workflow and `.kiro/uneri/` is empty or partial.
- Bootstrapping a new project (or a new bounded context) onto the UC-driven workflow.
- **NOT** to generate specs (that is `/uneri-skills:sdd-init`, after UCs exist) and **NOT** for GitHub Issues (that is `/uneri-skills:issue-upsert`).
- **NOT** when files already exist → each is skipped/augmented, never overwritten; use `uneri-skills:udd-add` to add UCs.

## Where this sits in the workflow

Recommended command order:

1. `/uneri-skills:steering` *(optional but recommended, especially multi-context)* — product / tech / **structure**.
   `structure.md` defines the bounded contexts; if it exists, this skill reconciles `<CTX>` against it (Step 3).
2. **`/uneri-skills:udd-init [CTX] --lang <code>`** — this skill: language + domain discovery + `use-cases.md`.
3. `/uneri-skills:udd-add` → `/uneri-skills:udd-validate` — author and verify UCs.
4. `/uneri-skills:sdd-init` → `-requirements` → `-clarify` → `-design` → `-tasks` → `-trace` — per UC, into a spec.

If your bounded contexts are already known, run `/uneri-skills:steering` first so `<CTX>` is settled top-down; for a
from-scratch or single-context start, this skill can go first and derive `<CTX>` itself (Step 3).

## Language (uneri config) — set here, once

**uneri-skills:udd-init is the single place language is chosen.** Resolve: `--lang <code>` (one of the 13 supported codes:
`ja, en, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el`) → existing `.uneri.json` `lang` → existing specs'
`spec.json` `language` → default `en`. Then **create `.uneri.json`** if missing
(`{ "agent": "claude-code-skills", "lang": "<resolved>" }`); if it exists, read it and **do not overwrite**
existing keys (Step 2 additionally records a `layout` field — see below).
Downstream `udd-*` / `steering` / `sdd-*` skills inherit this and take no `--lang`. All generated docs are written
in this language. Language is resolved here because docs are authored **before any `spec.json` exists**.

**Language is repo-wide — one `lang` per repo.** The single repo-root `.uneri.json` `lang` governs the
UC/domain-layer docs for **every** bounded context, including Pattern A (multi-context): all
`services/<ctx>/.kiro/uneri/*` files share it. There is **no per-context language override** (by design —
avoids a per-directory config layer). A repo whose contexts genuinely need different authoring languages
should be split into separate repos, one per language. (The spec layer may still vary per spec via
`spec.json.language`, but it defaults from this repo-wide `lang`.)

Split content (fixed tokens stay canonical, variable text localizes):

- **Keep canonical / verbatim in every language:** `inclusion: manual`; the `context:` frontmatter key; ID format `UC-<CTX>-NNN`;
  field keys `actor` / `realizes` / `aggregates`; band numbers `001–099` / `100–`;
  the `EVT-` / `AGG-` prefixes; and the **entities** of the principle line `UC` / `spec` / `GitHub Issue`.
- **Localize to the target language:** the title, section headings, explanatory prose,
  precondition/postcondition labels, and UC/actor/term names.

## Steps

1. **Resolve language & write `.uneri.json`** (see Language) — first, because every doc below is written in it.
2. **Detect state.** Inspect `.kiro/uneri/` (Pattern B) or `services/<ctx>/.kiro/uneri/` (Pattern A). Report what
   exists; only fill gaps. `use-cases.md` is a per-context uneri file — **one bounded context per file.**
   - **Pattern B** (single context — individual dev / small SaaS): **one** file at repo-root `.kiro/uneri/use-cases.md`.
   - **Pattern A** (multi-context / microservices): **one file per context** at `services/<ctx>/.kiro/uneri/use-cases.md`.
     Enumerate contexts from `services/*` (and/or `.kiro/steering/context-map.md`); scaffold each missing one.
   - Detect: a `services/<ctx>/` layout ⇒ A; a single root `.kiro/` ⇒ B. If ambiguous, ask.
   - **Record the decision in `.uneri.json`.** Once resolved (detected or confirmed), write the `layout` field:
     `single-context` for Pattern B, `multi-context` for Pattern A. Add the key without touching `agent`/`lang`;
     if `layout` already exists and disagrees with the current layout, warn and reconfirm rather than silently
     flipping it (the repo may be mid-migration). Downstream `udd-*` / `sdd-*` skills read this and cross-check it
     against the actual layout. **`layout` records the A/B decision only — the full CTX registry stays in `structure.md`'s
     `## Bounded contexts`, not in `.uneri.json`.** Each `use-cases.md` declares **its own** single context in its
     frontmatter `context: <CTX>` (self-identification — see Step 3 / skeleton), which is essential for Pattern A
     where `.uneri.json` (one root file) cannot carry per-file codes and a freshly scaffolded file has no UC headings
     to infer from. That per-file `context:` must match the file's UC-ID headings (`uneri-skills:udd-validate` enforces it).
3. **Determine `<CTX>` per file** — an uppercase bounded-context code. **Reconcile with existing steering first**
   (`.kiro/steering/context-map.md` / `structure.md`, `.kiro/uneri/glossary.md`); their codes win. In `structure.md`
   read the codes from the `## Bounded contexts` list (canonical form `- <CTX> — <description>`); if that section is
   absent, fall back to any `UC-<CTX>-NNN` / `AGG-<CTX>-NNN` / `EVT-<CTX>-NNN` naming or an inline `CTX = <CODE>`
   statement, and **confirm the inferred code with the user** before using it. Otherwise take it from the argument,
   else derive from the context (`order`→`ORD`, `delivery`→`DLV`) and confirm. **One `<CTX>` per file.**
   Write the resolved code into that file's frontmatter `context: <CTX>` (Step 5 skeleton) so the file self-identifies.
4. **Discover the domain (light EventStorming).** With the team (or, for an existing codebase, **retrospectively**
   from DB/API/architecture docs), elicit **Aggregates → Commands → Events**, plus Actors, Policies, Read Models,
   External Systems. Write/augment (in the resolved language, `inclusion: manual`; idempotent — augment gaps, never overwrite):
   - `domain-model.md` — aggregates `AGG-<CTX>-NNN` × commands→events `EVT-<CTX>-NNN` + state transitions + policies + read models. **Bilingual names** (localized label ＋ PascalCase English identifier).
   - `actors.md` — actor/stakeholder catalog (bilingual identifiers) + relationship map + `actor:` controlled vocabulary.
   - `glossary.md` — classification Enums (value objects) + core terms.

   For a quick single-context start these may be kept light or deferred, but producing them is recommended so UCs have
   `EVT-`/`AGG-` IDs to reference.
5. **Scaffold `use-cases.md`.** For each target file: if it already exists, **skip it — never overwrite.** Otherwise
   write the skeleton (below) in the resolved language, with **empty** sections, **substituting the file's real `<CTX>`
   into the frontmatter `context:`** (not the literal `<CTX>`). Do not seed example UCs into the live file. Report created vs skipped.
6. **Route onward.** Guide the user to author UCs with `uneri-skills:udd-add` (🌊 user-goal × 1 spec), verify with `uneri-skills:udd-validate`,
   fill/refresh steering with `/uneri-skills:steering` if not done, and later `/uneri-skills:sdd-init`. Optionally seed the first UC via
   `uneri-skills:udd-add` from the discovered commands.

## The `use-cases.md` skeleton it writes

Canonical (English) reference — localize the headings/prose to the resolved language, keep the canonical tokens verbatim:

```markdown
---
inclusion: manual
context: <CTX>
---

# Use Cases (<Product or Context name>)

Use cases are uneri-managed knowledge (`.kiro/uneri/`, loaded on demand). Principle: `1 UC = 1 spec = 1 GitHub Issue`.
Upstream Domain Event / Aggregate live in `domain-model.md`; each UC references them via `realizes` / `aggregates`.

## UC-ID convention

- Format `UC-<CTX>-NNN` (`<CTX>` = bounded-context code; `NNN` = **per-context** 3-digit zero-padded serial).
- Number bands: **001–099 functional UCs** (user-facing) / **100– operational UCs** (developer-facing: CI/CD, dev env, monitoring). Both bands are *functional goals*; non-functional requirements are **not** UCs (put them in `tech.md`/`structure.md` or a spec's `requirements.md`).
- IDs are immutable and never reused; retired UCs keep their number (no back-filling gaps).
- Required field per UC: `actor` only.
  Optional `realizes: [EVT-…]` / `aggregates: [AGG-…]` / preconditions / postconditions.
- Do **not** write Status / Spec / Issue — those are derived (a matrix from
  `spec.json` / `tasks.md`). This file holds only upstream declarations; no double maintenance.

## Functional use cases

<!-- add with /uneri-skills:udd-add, e.g.
### UC-<CTX>-001 <name>
- actor: <actor>
-->

## Operational use cases

<!-- e.g.
### UC-<CTX>-100 Build the CI/CD pipeline
- actor: developer
-->
```

Example for a `ja` project: the headings localize to `# ユースケース一覧`, `## UC-ID 規約`,
`## 機能ユースケース`, `## 運用ユースケース`; the keys, IDs, and band numbers stay identical.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                                | ✅ Correct                                                                                        |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Overwriting existing `.kiro/uneri/` files                                 | Idempotent: skip/augment, never overwrite                                                         |
| Hardcoding one language / ignoring the project's language                 | Localize headings & prose to `.uneri.json` `lang` (see Language); default `en`                    |
| Skipping domain discovery, leaving UCs nothing to reference               | Produce/augment `domain-model.md` / `actors.md` / `glossary.md` so UCs have `EVT-`/`AGG-`         |
| Obsidian-style frontmatter (`title`/`tags`/`status`)                      | uneri frontmatter: **`inclusion: manual` ＋ `context: <CTX>`** (real code, not literal)           |
| Rich per-UC cards (Status/Goal/Trigger/Flow/Acceptance/Priority)          | Minimal card: **`actor`** (+ optional realizes/aggregates/pre-post)                               |
| Adding a `size` or Priority field to the card                             | The card is `actor` only (plus optional links); a `size:` line written by another tool is ignored |
| Seeding example/placeholder UCs into the live file                        | Leave UC authoring to `uneri-skills:udd-add`; this skill sets up the domain + empty skeleton      |
| Inline `Status:` / `Spec:` / `Issue:` fields                              | Those are **derived** from specs and tasks; never hand-maintained here                            |
| Flat UC list                                                              | Split **functional / operational** sections with number bands 001–099 / 100–                      |
| Multiple `<CTX>` in one file / one combined file for a multi-context repo | **One `<CTX>` per file**; Pattern A = one file per context, Pattern B = one file                  |
| Modeling NFRs as UCs                                                      | NFRs → `tech.md`/`structure.md` or spec `requirements.md`, not UCs                                |
