---
title: Workflow
description: How the skills fit together.
---

```text
steering ─▶ udd-init ─▶ udd-add ─▶ udd-validate ─▶ (udd-arrange)
                           │
                           ▼
sdd-init ─▶ sdd-requirements ─▶ sdd-clarify ─▶ sdd-design ─▶ sdd-validate-design
                                                                  │
                                                                  ▼
          pr-upsert ◀─ sdd-validate-impl ◀─ sdd-impl ◀─ sdd-tasks
```

- For an existing codebase, start with `sdd-validate-gap` (gap analysis).
- Cross-cutting skills: `steering`, `review`, `debug`, `verify-completion`, `issue-upsert`, `adr`, `sdd-compact`, `sdd-trace`.
- `sdd-clarify` always runs before design. If there is nothing to clarify, it records "no open questions".
