---
title: "/uneri-skills:sdd-trace"
description: "Audit use case ↔ spec ↔ requirement ↔ task consistency, and count progress"
---

Audit use case ↔ spec ↔ requirement ↔ task consistency, and count progress.
Part of: SDD: from spec to implementation. See [all skills](./).

## Usage

```text
/uneri-skills:sdd-trace
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Use to audit UC↔spec↔requirement↔task consistency across the project — reports orphan specs, un-specced use cases, dangling task references, and requirement/scenario coverage gaps, and counts progress as implemented use cases out of active ones (deprecated use cases are not counted). Reports only; never writes, never blocks (same philosophy as uneri-skills:udd-validate). Local-only. Triggers include "trace check", "整合を検査", "spec trace". Output language follows `.uneri.json`.
