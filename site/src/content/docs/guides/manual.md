---
title: Practical manual
description: A worked example that takes you from UDD to an SDD implementation, step by step.
---

For someone installing uneri for the first time. One worked example, from UDD through SDD implementation.

## What this is

uneri is a Claude Code plugin that connects use-case-driven development (UDD) and spec-driven development (SDD).
A use case (UC) that you discover and write down in UDD is followed through SDD, from requirements to design,
tasks and implementation, as one line that you never have to rebuild midway.
Every artifact stays in your project as Markdown or JSON, so you can run `/uneri-skills:sdd-trace` at any time to audit
that UC ↔ spec ↔ requirement ↔ task are consistent.

## Install (shortest path)

Use either of these:

- **Marketplace**: `/plugin marketplace add uneri-app/uneri-skills` → `/plugin install uneri-skills@uneri-app`
- **Local**: `claude --plugin-dir /path/to/uneri-skills/plugins/uneri-skills`

After installing, run `/reload-plugins`. From then on, call skills as `/uneri-skills:<name>` (for example `/uneri-skills:udd-init`).

## The big picture

The recommended order:

```
/uneri-skills:steering [--lang <ja|en>]      # recommended first: language + product / tech / structure
/uneri-skills:udd-init [CTX]                  # domain discovery + use-cases.md scaffold
/uneri-skills:udd-add → /uneri-skills:udd-validate  # write UCs → check consistency
/uneri-skills:udd-arrange                     # optional: order a long list by the user's journey
# Then turn each UC into a spec and implement it:
/uneri-skills:sdd-init → -requirements → -clarify → -design → -validate-design → -tasks
                → -impl → -validate-impl → -trace
# For an existing codebase (brownfield), run -validate-gap before -tasks
```

- UDD discovers and writes down UCs.
- SDD moves each UC through requirements → design → tasks → implementation.
- `validate-*` skills are gates.
- `review`, `debug` and `verify-completion` are disciplines that `sdd-impl` calls for each task (you can also start them yourself).
- `adr` records a decision that outlives one spec. `sdd-design` offers it when it finds one; you can also start it to write, audit or consult ADRs.

## Try it (the ORD example)

The example is an `order` (order management) domain with CTX = `ORD`, and one UC:
`UC-ORD-001 A customer places an order` (`actor: Customer`, `realizes: [EVT-ORD-001]`).

### 0. steering (recommended first)

- **Run**: `/uneri-skills:steering --lang en`
- **Produces**: `.uneri.json` (keeps `lang`), `.kiro/steering/{product,tech,structure}.md`. With existing code it drafts them from it and marks what it inferred `draft: … confirm`.
- **Check by eye**: `structure.md` lists `- ORD — order management` under `## Bounded contexts`.
- **Move on when**: `product.md` says what, why and for whom. In a new project the rest stays empty for now; run `steering` again after `udd-init` and it proposes the contexts found there.

### 1. Domain discovery: udd-init

- **Run**: `/uneri-skills:udd-init ORD`
- **Produces**: `.kiro/uneri/{domain-model,actors,glossary,use-cases}.md`. If `.uneri.json` is missing (you started here), it also sets the language: add `--lang en`.
- **Check by eye**: the frontmatter of `use-cases.md` has `context: ORD`.
- **Move on when**: `.uneri.json` exists and the language is fixed.

### 2. Add a UC: udd-add

- **Run**: `/uneri-skills:udd-add`
- **Produces**: `### UC-ORD-001 A customer places an order` is appended to `use-cases.md`
  (`actor: Customer` / `realizes: [EVT-ORD-001]`).
- **Check by eye**: the number is `UC-ORD-001` and stays fixed, and `actor` exists in `actors.md`.
- **Move on when**: there is at least one UC.

### 3. Validate: udd-validate

- **Run**: `/uneri-skills:udd-validate`
- **Produces**: a read-only report (no files).
- **Check by eye**: no duplicates, gaps or missing required fields.
- **Move on when**: zero errors.
- **Later, when the list is long**: `/uneri-skills:udd-arrange` reorders the use cases by the user's journey, under
  `<!-- journey: … -->` markers. It only moves entries; no ID, text or field changes, and it writes after you approve.

### 4. Seed a spec: sdd-init

- **Run**: `/uneri-skills:sdd-init` (choose UC-ORD-001)
- **Produces**: `.kiro/specs/001-customer-places-order/spec.json`
- **Check by eye**: `spec.json` points at the UC.
- **Move on when**: the spec directory exists.

### 5. Requirements

- **Run**: `/uneri-skills:sdd-requirements`
- **Produces**: `.kiro/specs/001-customer-places-order/requirements.md` (EARS format)
- **Check by eye**: the UC's scenarios became EARS statements.
- **Move on when**: you approve the requirements.

### 6. (Optional) Clarify

- **Run**: `/uneri-skills:sdd-clarify`
- **Produces**: clarifications are appended to `requirements.md`.
- **Check by eye**: the ambiguities are resolved.
- **Move on when**: nothing more needs to be asked.

### 7. Design

- **Run**: `/uneri-skills:sdd-design`
- **Produces**: `.kiro/specs/001-customer-places-order/design.md`
- **Check by eye**: the approved requirements are reflected.
- **Move on when**: you approve the design.

### 8. Design gate: validate-design

- **Run**: `/uneri-skills:sdd-validate-design`
- **Produces**: a review result (no files).
- **Check by eye**: the design is good enough before implementation.
- **Move on when**: GO.

### 8'. (Brownfield only) validate-gap

- **Run**: `/uneri-skills:sdd-validate-gap`
- **Produces**: a gap report (no files).
- **Check by eye**: you understand the difference from the existing code.
- **Move on when**: for brownfield, run this **before `-tasks`**.

### 9. Tasks

- **Run**: `/uneri-skills:sdd-tasks`
- **Produces**: `.kiro/specs/001-customer-places-order/tasks.md` (checkbox format)
- **Check by eye**: the design is broken down into tasks.
- **Move on when**: you approve the tasks.

### 10. Implement: sdd-impl

- **Run**: `/uneri-skills:sdd-impl` (it will not start unless the tasks are approved; once started it runs to the end without stopping)
- **Produces**: source code, tests, and selective git commits.
- **Check by eye**: each task goes green with TDD, and review / debug / verify-completion run for every task.
- **Move on when**: every task is implemented.

### 11. Implementation gate: validate-impl

- **Run**: `/uneri-skills:sdd-validate-impl`
- **Produces**: a GO / NO-GO verdict (no files).
- **Check by eye**: tests pass at the feature level.
- **Move on when**: GO.

### 12. Audit: trace

- **Run**: `/uneri-skills:sdd-trace`
- **Produces**: a read-only trace report of UC ↔ spec ↔ requirement ↔ task.
- **Check by eye**: every link is consistent.
- **Move on when**: the audit is clean.

## Artifact map

| File                                                                    | Location                                                        | Created by                                  | Role                                                |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| `.uneri.json`                                                           | repo root                                                       | `udd-init`                                  | Settings that keep `lang` and `layout`              |
| `.kiro/uneri/use-cases.md`                                              | repo root for a single context (needs a `context:` frontmatter) | `udd-init` (scaffold) → `udd-add` (entries) | The list of UCs                                     |
| `.kiro/uneri/{domain-model,actors,glossary}.md`                         | `.kiro/uneri/`                                                  | `udd-init`                                  | By-products of domain discovery                     |
| `.kiro/steering/*.md`                                                   | `.kiro/steering/`                                               | `steering` (optional)                       | Project-wide steering, inherited by impl and review |
| `.kiro/specs/<NNN-slug>/{spec.json,requirements.md,design.md,tasks.md}` | `.kiro/specs/<NNN-slug>/`                                       | `sdd-init` onward, one step at a time       | The full spec of one UC                             |

## Gates and review

- `-validate-design`: the gate before implementation. Check the design quality before moving to `-tasks`.
- `-validate-gap`: for brownfield only, before `-tasks`. Analyzes the gap with the existing code.
- `-validate-impl`: the gate after all tasks are implemented. Gives a feature-level GO / NO-GO.
- `review`, `debug` and `verify-completion` are disciplines that `sdd-impl` calls for each task (you can also start them yourself).

## Common pitfalls

- How CTX is decided: the `context:` frontmatter of `use-cases.md` → `## Bounded contexts` in `structure.md` → inferred from existing UCs, in that order. The directory name is never used.
- For brownfield, put `-validate-gap` before `-tasks`.
- Only three skills have side effects: `sdd-impl`, `issue-upsert` and `pr-upsert`. All of them can start from a natural request (you do not have to invoke them explicitly). `sdd-impl` stops unless the tasks are approved, and runs to the end once started.
  `issue-upsert` and `pr-upsert` always ask for your confirmation before a push or a `gh` write.
- Run `steering` first, so the CTX is fixed before `udd-init`. Starting with `udd-init` also works; it derives the CTX itself.
- `--lang` is set once for the whole repository; it cannot be set per context.

## Next steps

- Run `/uneri-skills:sdd-trace` regularly to audit that UC ↔ spec ↔ requirement ↔ task stay consistent.
- Use `/uneri-skills:issue-upsert` to rewrite a UC's GitHub issue into a human-readable record of what this change cycle did (only the requirements that changed).
- Use `/uneri-skills:pr-upsert` to create or update a PR. A UC's PR is built from the spec (draft or ready follows `spec.json.phase`, and the UC label is added at creation).
  Work that no UC owns goes through `/uneri-skills:pr-upsert bug|enabler|chore`, which adds a kind label.
