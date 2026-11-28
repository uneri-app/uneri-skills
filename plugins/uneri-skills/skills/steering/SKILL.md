---
name: steering
description: Use when a project needs steering docs (product / tech / structure) for spec-driven development — bootstraps `.kiro/steering/` from the codebase, or syncs it when the code has drifted. The UC-layer domain docs (`domain-model.md` / `actors.md` / `glossary.md` under `.kiro/uneri/`) are referenced as domain steering, never duplicated. Triggers include "set up steering", "create product/tech/structure docs". Takes `[--lang {code}]`.
---

# uneri-skills:steering — bootstrap and sync `.kiro/steering/`

## Overview

Maintains **three convention-correct steering files** under `.kiro/steering/`:
`product.md` (what / why / users), `tech.md` (stack, non-functional constraints), and
`structure.md` (bounded contexts, directory layout, context map). These files are the
project-wide steering layer for spec-driven development (SDD) — they complement, never
duplicate, the UC-layer domain docs (`domain-model.md` / `actors.md` / `glossary.md`) under
`.kiro/uneri/`. Local-only (no `gh`, no MCP). **Output is written in the project's configured
language** (see Language).

Two modes, chosen by what exists under `.kiro/steering/`:

- **Bootstrap** — a core file is missing: read the codebase and **draft** the missing files
  from what it shows (patterns, not catalogs). Where the code shows nothing, leave the section
  empty with its guidance comment.
- **Sync** — all three exist: report drift between the steering and the code, and propose
  additive updates. Existing content is never overwritten.

When both layers exist the separation is:

- **`.kiro/steering/`** — product direction, tech decisions, and system boundaries. Consumed by
  both human reviewers and AI agents as persistent context.
- **`.kiro/uneri/`** — domain model, actors, glossary, and use cases. Produced and maintained by
  the `/uneri-skills:udd-*` skills; `uneri-skills:steering` reads but never writes there.

## When to use

- A new project or new context has no `.kiro/steering/` yet and needs a steering baseline.
- An existing project (brownfield) is adopting SDD and wants product/tech/structure context for
  AI agents, drawn from the code it already has.
- The code has moved on and the steering may be stale (Sync).
- **NOT** for spec content (requirements, acceptance criteria) — that is the `sdd-*` skills.
- **NOT** for domain modeling (actors, aggregates, events) — that is `/uneri-skills:udd-init`.
- **NOT** to overwrite an existing steering file → each existing file is kept as is; Sync only
  proposes additions.

## Language

Emit the files in the project's language. Resolve it the way `/uneri-skills:udd-init` does: `--lang <code>` (one of `ja, en, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el`) → `.uneri.json` → `lang` → the language of existing specs' `spec.json` → default **`en`**.

**This skill is where the language is chosen** (it is the recommended first command; `/uneri-skills:udd-init --lang` does the same if you start there instead). If `.uneri.json` is **missing**, create it: `{ "agent": "claude-code-skills", "lang": "<resolved>" }`. If it **exists**, read it and **do not overwrite** it; when `--lang` differs from its `lang`, keep the file's value and tell the user (one `lang` per repo — change it in `.uneri.json` by hand).

Split content (fixed tokens stay canonical, variable text localizes):

- **Keep canonical / verbatim in every language:** frontmatter key `inclusion`; context-code
  format `<CTX>` (uppercase); path references `.kiro/steering/`, `.kiro/uneri/`; file names
  `product.md` / `tech.md` / `structure.md`; the label `ADR directory:` (it is searched for).
- **Localize to the target language:** the title, section headings, explanatory prose, and
  placeholder guidance comments.

## Steps

1. **Resolve the language** (see Language: `--lang`, else the existing config) and **persist it to `.uneri.json`**
   (create if missing, never overwrite if it exists).
2. **Detect the mode.** Check `product.md`, `tech.md`, `structure.md` under `.kiro/steering/`.
   Any missing → **Bootstrap** for the missing files only (existing ones are never touched).
   All present → **Sync**.
3. **Read the codebase (Bootstrap)**, with Read / Glob / Grep only. Three independent areas, run
   in parallel when you can:
   - **Product:** README and docs → purpose, value, core capabilities.
   - **Tech:** build and config files (`package.json`, `pom.xml`, `build.gradle`, `pyproject.toml`,
     `go.mod`, `Cargo.toml`, CI config, …) → language, frameworks, data stores, conventions.
   - **Structure:** the directory tree, naming, module boundaries → how the code is organized.
     If the project has no code or docs yet, there is nothing to read: write the skeletons below.
4. **Write the files** (see below) in the resolved language, following the skeletons. Fill a
   section only with what Step 3 showed, as **patterns that guide decisions** ("feature-first
   packages", "constructor injection") — not a list of every file or dependency. Mark each
   inferred section with `<!-- draft: inferred from <source>; confirm -->`. **Leave empty, with
   its guidance comment:** `## Why`, `## Non-functional constraints`, and anything the code does
   not show. Never invent users, requirements, or a bounded-context list. Never write keys,
   passwords or secrets.
5. **Reconcile context codes.** If `.kiro/uneri/glossary.md` or `.kiro/uneri/structure.md` exists,
   copy any established bounded-context codes (`<CTX>`) into the context-map scaffold in
   `structure.md` so the two layers stay consistent. Do **not** modify the `.kiro/uneri/` files.
6. **Sync (all three exist).** Read the three files and re-read the code as in Step 3. Report:
   steering that names something the code no longer has (warning), code patterns the steering
   does not mention (update candidate), and whether a custom file such as `api-standards.md`
   would help. Also compare the bounded-context codes (`<CTX>`) in `.kiro/uneri/glossary.md` and
   `use-cases.md` with `structure.md`'s `## Bounded contexts`; a code that is missing there is a
   proposed addition (this is how contexts found by `/uneri-skills:udd-init` reach the steering).
   **Propose** the additions and apply one only when the user agrees, appending
   rather than replacing. Do not touch the user's own text.
7. **Summarize** created / kept / proposed per file, and which sections are drafts to confirm
   (Bootstrap) or drift found (Sync). Ask the user to review the drafts as the project's source of
   truth. Then point to `/uneri-skills:udd-init` (if not done) and `/uneri-skills:udd-add`, and
   `/uneri-skills:sdd-init` when they are ready to start a spec.

Golden rule: if new code follows the existing patterns, the steering should not need updating.

## The files it writes

Canonical (English) reference — localize the headings and prose comments to the resolved language;
keep canonical tokens (file names, path refs, `inclusion: manual`) verbatim. The comments are guidance
for the section; replace one with content only when the code shows it (Step 4), otherwise keep it.

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

<!-- Notable decisions or trade-offs not already captured in a spec. Summarize; link to ADRs if any.
     If the project keeps ADRs, name their directory on one line, exactly: `ADR directory: <path>`
     (for example `ADR directory: docs/adr`). `/uneri-skills:adr` reads that line first. -->
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

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                 | ✅ Correct                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Overwriting an existing steering file                      | **Never overwrite** — create only missing files; for existing ones, Sync proposes additions       |
| Leaving every section empty on a project that has code     | **Bootstrap from the code** (Step 3–4); empty only where the code shows nothing                   |
| Cataloguing every file or dependency                       | Write patterns that guide decisions; the steering should not change when new code follows them    |
| Inventing Why, users, NFRs or contexts the code can't show | Leave them empty with the guidance comment; mark inferred text `draft: … confirm`                 |
| Copying domain-model / actor catalog content into steering | Steering references `.kiro/uneri/` docs; it never duplicates them                                 |
| Hardcoding one language / ignoring the project's language  | Localize headings & prose to `.uneri.json` `lang` (see Language); default `en`                    |
| Putting use-case content (actor, UC-IDs) in steering files | UC content belongs in `.kiro/uneri/use-cases.md`; steering is project context only                |
| Putting non-functional requirements in `use-cases.md`      | NFRs are **not UCs**; they belong in `tech.md` or a spec's `requirements.md`                      |
| Writing to `.kiro/uneri/` from this skill                  | uneri-skills:steering writes only under **`.kiro/steering/`**; `.kiro/uneri/` is read-only for it |
