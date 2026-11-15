---
title: UDD and SDD
description: The two methods uneri builds on, and the names of the artifacts.
---

- **UDD (use-case-driven development)**: the unit of work is the use case. IDs look like `UC-<CTX>-NNN`, and the list lives in `.kiro/uneri/use-cases.md`.
- **SDD (spec-driven development)**: one use case becomes one spec (`.kiro/specs/<NNN-slug>/`), which moves through requirements, design, tasks and implementation, with an approval at each step.
- **Tracing**: a spec points to its use case through `traces_uc` in `spec.json`. Pull requests and issues point to it through a `UC-<CTX>-NNN` label.

Command prefixes name the method (`udd-` / `sdd-`). The artifacts keep their own names: `use-cases.md`, `UC-` IDs, `.kiro/specs/` and `spec.json`.
The meaning of `phase` in `spec.json` is in the [reference](../../reference/spec-json-phase/).
