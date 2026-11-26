---
title: "/uneri-skills:sdd-requirements"
description: "Generate EARS requirements from the use case's scenarios"
---

Generate EARS requirements from the use case's scenarios.
Part of: SDD: from spec to implementation. See [all skills](./).

## Usage

```text
/uneri-skills:sdd-requirements
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Use after `/uneri-skills:sdd-init` to generate EARS requirements for a spec, auto-seeded from the traced use case's sunny-day and rainy-day scenarios. Refuses to run until the spec exists. Triggers include "generate requirements", "requirements を作る", "spec requirements". Output language follows `.uneri.json` / `spec.json`.
