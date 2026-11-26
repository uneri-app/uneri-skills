---
title: "/uneri-skills:udd-validate"
description: "Check `use-cases.md` for duplicates, gaps and missing fields"
---

Check `use-cases.md` for duplicates, gaps and missing fields.
Part of: UDD: find and write use cases. See [all skills](./).

## Usage

```text
/uneri-skills:udd-validate
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Use when checking a `.kiro/uneri/use-cases.md` for integrity — a read-only, Markdown-only validation (lint-style, no deps) reporting UC-ID duplicates and gaps, band/section violations, missing or unregistered actors, dangling `realizes`/`aggregates`, stray generated fields and localized field keys. Triggers include "validate use cases", "lint use cases", or after uneri-skills:udd-add. Reports only (does not edit).
