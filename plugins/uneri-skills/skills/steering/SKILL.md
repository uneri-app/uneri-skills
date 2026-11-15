---
name: steering
description: Use when a project needs steering docs (product / tech / structure) for spec-driven development — bootstraps or syncs `.kiro/steering/`. The UC-layer domain docs (`domain-model.md` / `actors.md` / `glossary.md` under `.kiro/uneri/`) are referenced as domain steering, never duplicated. Local-only (no `gh`, no MCP). Triggers include "set up steering", "create product/tech/structure docs", "steering を作る". Output language follows `.uneri.json`.
---

# uneri-skills:steering — scaffold `.kiro/steering/`

## Overview

Creates **three convention-correct steering files** under `.kiro/steering/`:
`product.md` (what / why / users), `tech.md` (stack, non-functional constraints), and
`structure.md` (bounded contexts, directory layout, context map). These files are the
project-wide steering layer for spec-driven development (SDD) — they complement, never
duplicate, the UC-layer domain docs (`domain-model.md` / `actors.md` / `glossary.md`) under
`.kiro/uneri/`. Local-only (no `gh`, no MCP). **Output is written in the project's configured
language** (see Language).

When both layers exist the separation is:

- **`.kiro/steering/`** — product direction, tech decisions, and system boundaries. Consumed by
  both human reviewers and AI agents as persistent context.
- **`.kiro/uneri/`** — domain model, actors, glossary, and use cases. Produced and maintained by
  the `/uneri-skills:udd-*` skills; `uneri-skills:steering` reads but never writes there.

## When to use

- A new project or new context has no `.kiro/steering/` yet and needs a steering baseline.
- An existing project is adopting SDD and wants to formalize product/tech/structure context for
  AI agents.
- **NOT** for spec content (requirements, acceptance criteria) — that is the `spec-*` skills.
- **NOT** for domain modeling (actors, aggregates, events) — that is `/uneri-skills:udd-init`.
- **NOT** when a steering file already exists → each existing file is skipped (never overwritten).

## Language (uneri config)

Emit the files in the project's language, taken from **`.uneri.json`** (`lang`) — which
**`/uneri-skills:udd-init` sets once** (via its `--lang`). uneri-skills:steering **reads** it and takes no
`--lang`. Resolution when reading:

1. `.uneri.json` → `lang` (uneri's own repo-root config; **cc-sdd does not write this file** — see below);
2. else the language of existing specs' `spec.json` → `language`;
3. else default **`en`**.

**`.uneri.json` is created by `/uneri-skills:udd-init`** (the entry point, via `--lang`) and carries the
project-wide language for all `/uneri-skills:*` skills. If uneri-skills:steering runs **standalone** (no
uneri-skills:udd-init) and `.uneri.json` is **missing**, create it as a fallback with the resolved value
(`{ "agent": "claude-code-skills", "lang": "<resolved>" }`); if it **exists**, read it and **do
not overwrite** it.

(cc-sdd itself has no `.cc-sdd.json`; it only takes `--lang` per run and persists language in each
spec's `spec.json`. `.uneri.json` is uneri's own layer — do not name it `.cc-sdd.json`.)

Split content like cc-sdd's EARS rule (fixed tokens stay canonical, variable text localizes):

- **Keep canonical / verbatim in every language:** frontmatter key `inclusion`; context-code
  format `<CTX>` (uppercase); path references `.kiro/steering/`, `.kiro/uneri/`; file names
  `product.md` / `tech.md` / `structure.md`.
- **Localize to the target language:** the title, section headings, explanatory prose, and
  placeholder guidance comments.

## Steps

1. **Resolve the language** (see Language) and **persist it to `.uneri.json`** (create if missing,
   never overwrite if it exists).
2. **Guard each file.** For each of `product.md`, `tech.md`, and `structure.md` under
   `.kiro/steering/`, if it already exists **skip it — never overwrite.** Create only the missing
   files; report created vs. skipped to the user.
3. **Write the skeletons** (see below) in the resolved language, with **empty** sections and
   commented guidance. Do not seed real content — the user fills the docs.
4. **Reconcile context codes.** If `.kiro/uneri/glossary.md` or `.kiro/uneri/structure.md` exists,
   copy any established bounded-context codes (`<CTX>`) into the context-map scaffold in
   `structure.md` so the two layers stay consistent. Do **not** modify the `.kiro/uneri/` files.
5. Tell the user to add use cases with `/uneri-skills:udd-init` (if not done) and then `/uneri-skills:udd-add`,
   and to run `/uneri-skills:sdd-init` when they are ready to start a spec.

## The files it writes

Canonical (English) reference — localize the headings and prose comments to the resolved language;
keep canonical tokens (file names, path refs, `inclusion: manual`) verbatim.

### `product.md`

```markdown
---
inclusion: manual
---

# Product Steering

<!-- What problem does this product solve? Fill in once; keep up to date. -->

## What

<!-- One-sentence product definition. -->

## Why

<!-- Core user problem and the value this product delivers. -->

## Users

<!-- Who are the primary users / personas? Reference actors.md for the domain catalog. -->
```

### `tech.md`

```markdown
---
inclusion: manual
---

# Tech Steering

<!-- Technology decisions and non-functional constraints. Non-functional requirements belong here
     (performance, security, availability, i18n, scalability) — not in use-cases.md. -->

## Stack

<!-- Runtime, frameworks, primary data stores, deployment platform. -->

## Non-functional constraints

<!-- Key NFRs that apply project-wide (latency targets, compliance, SLA, data-residency, etc.). -->

## Architecture decisions

<!-- Notable decisions or trade-offs not already captured in a spec. Summarize; link to ADRs if any. -->
```

### `structure.md`

```markdown
---
inclusion: manual
---

# Structure Steering

<!-- Bounded contexts, directory layout, and how contexts relate.
     Keep in sync with context codes used in use-cases.md (UC-<CTX>-NNN). -->

## Bounded contexts

<!-- List each context and its purpose.
     Example:
     - ORD — order management
     - DLV — delivery tracking
-->

## Directory layout

<!-- High-level source layout (mono-repo vs. poly-repo, service boundaries). -->

## Context map

<!-- How contexts integrate (Shared Kernel, Customer/Supplier, ACL, etc.).
     Populate codes from .kiro/uneri/glossary.md if it exists. -->
```

## Common mistakes (each observed in baseline attempts — do NOT repeat)

| ❌ Mistake                                                 | ✅ Correct                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Overwriting an existing steering file                      | **Skip it** — never overwrite; create only missing files, report skipped                          |
| Copying domain-model / actor catalog content into steering | Steering references `.kiro/uneri/` docs; it never duplicates them                                 |
| Hardcoding one language / ignoring the project's language  | Localize headings & prose to `.uneri.json` `lang` (see Language); default `en`                    |
| Putting use-case content (actor, UC-IDs) in steering files | UC content belongs in `.kiro/uneri/use-cases.md`; steering is project context only                |
| Putting non-functional requirements in `use-cases.md`      | NFRs are **not UCs**; they belong in `tech.md` or a spec's `requirements.md`                      |
| Naming the config `.cc-sdd.json` (cc-sdd never writes it)  | Use uneri's own **`.uneri.json`**; cc-sdd persists language only in each spec's `spec.json`       |
| Writing to `.kiro/uneri/` from this skill                  | uneri-skills:steering writes only under **`.kiro/steering/`**; `.kiro/uneri/` is read-only for it |

## Note on invocation

Invoked as `/uneri-skills:steering` — the `uneri-skills:` namespace is supplied by the plugin. Language comes from
`.uneri.json` (set by `/uneri-skills:udd-init`); this skill takes no `--lang` (standalone: falls back to
`spec.json`/`en` and creates `.uneri.json`).
