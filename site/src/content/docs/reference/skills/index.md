---
title: "Skills"
---

The skills are split by the method they belong to, and the prefix says which. `udd-` skills (use-case-driven development) work on the project's list of use cases; `sdd-` skills (spec-driven development) work on the spec of one use case. The rest serve both, so they carry no prefix. The files they produce keep their own names: `use-cases.md`, `UC-<CTX>-NNN` IDs, `.kiro/specs/` and `spec.json`. How the skills follow one another is in the [workflow](../../concepts/workflow/).

## UDD: find and write use cases

Decide **what** to build. These skills find the use cases of your product and keep them as one list, `.kiro/uneri/use-cases.md`, where every use case has a stable ID. They work on the whole project and write Markdown only. `udd-authoring` is a knowledge skill: it holds the conventions (ID system, notation, size of a use case) that the others follow.

| Skill | What it does |
| --- | --- |
| [`/uneri-skills:udd-add`](./udd-add/) | Append one use case with an auto-numbered, immutable ID |
| [`/uneri-skills:udd-arrange`](./udd-arrange/) | Reorder the use cases by the user's journey, without changing any ID |
| [`/uneri-skills:udd-authoring`](./udd-authoring/) | The conventions the UDD skills follow: ID system, notation, size of a use case |
| [`/uneri-skills:udd-init`](./udd-init/) | Entry point: language, light EventStorming, and the `use-cases.md` scaffold |
| [`/uneri-skills:udd-validate`](./udd-validate/) | Check `use-cases.md` for duplicates, gaps and missing fields |

## SDD: from spec to implementation

Decide **how** to build one use case, and build it. One use case becomes one spec, which moves through requirements, clarification, design and tasks to a verified implementation, with an approval at each step. They work on one use case at a time.

| Skill | What it does |
| --- | --- |
| [`/uneri-skills:sdd-clarify`](./sdd-clarify/) | Surface ambiguities before design |
| [`/uneri-skills:sdd-compact`](./sdd-compact/) | Rewrite a spec to describe the present: fold history, fix drift, make it self-contained |
| [`/uneri-skills:sdd-design`](./sdd-design/) | Generate the design, with explicit in-scope and out-of-boundary commitments |
| [`/uneri-skills:sdd-impl`](./sdd-impl/) | Implement approved tasks with TDD and subagents |
| [`/uneri-skills:sdd-init`](./sdd-init/) | Seed a spec from one use case |
| [`/uneri-skills:sdd-requirements`](./sdd-requirements/) | Generate EARS requirements from the use case's scenarios |
| [`/uneri-skills:sdd-tasks`](./sdd-tasks/) | Break the design into a checkbox task list |
| [`/uneri-skills:sdd-trace`](./sdd-trace/) | Audit use case ↔ spec ↔ requirement ↔ task consistency, and count progress |
| [`/uneri-skills:sdd-validate-design`](./sdd-validate-design/) | Review the design before implementation |
| [`/uneri-skills:sdd-validate-gap`](./sdd-validate-gap/) | Analyze the gap with an existing codebase (brownfield) |
| [`/uneri-skills:sdd-validate-impl`](./sdd-validate-impl/) | GO / NO-GO gate after all tasks are implemented |

## Cross-cutting

Not tied to one phase: steering documents, the quality checks that `sdd-impl` calls for each task (`review`, `debug`, `verify-completion`), the GitHub skills that label issues and pull requests, and ADRs, which keep the reason behind a decision that outlives a spec.

| Skill | What it does |
| --- | --- |
| [`/uneri-skills:adr`](./adr/) | Draft, audit or consult Architecture Decision Records |
| [`/uneri-skills:debug`](./debug/) | Root-cause-first investigation |
| [`/uneri-skills:issue-upsert`](./issue-upsert/) | Create or update one GitHub issue (a use case's, or `bug` / `enabler` / `chore`) |
| [`/uneri-skills:pr-upsert`](./pr-upsert/) | Create or update the current branch's pull request, always labelled |
| [`/uneri-skills:review`](./review/) | Review a task against its spec and boundaries |
| [`/uneri-skills:steering`](./steering/) | Project-wide steering docs (product, tech, structure) |
| [`/uneri-skills:verify-completion`](./verify-completion/) | Verify a "done" claim with fresh evidence |

## How they fit together

- For an existing codebase, run `sdd-validate-gap` before `sdd-tasks`.
- `sdd-design` offers `adr` when a decision outlives the spec: the spec keeps how, the ADR keeps why.
- `review`, `debug` and `verify-completion` are called by `sdd-impl` for each task; you rarely run them by hand.

## What writes outside your files

Most skills only read and write local files. Three have side effects:

- **`sdd-impl`** writes source code, runs tests, dispatches subagents and makes git commits. It will not start until the tasks are approved, and then runs to the end.
- **`issue-upsert`** and **`pr-upsert`** write to GitHub through `gh`. They always show you the exact commands and wait for your confirmation before pushing or writing anything.

What each skill may run without asking is on the [Permissions](../../guides/permissions/) page.
