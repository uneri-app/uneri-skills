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

> Use when checking a `.kiro/uneri/use-cases.md` for integrity — a read-only, Markdown-only validation (lint-style, no deps) reporting UC-ID duplicates, band/section violations, a missing `actor`, unregistered actors, dangling `realizes`/`aggregates`, multiple `{CTX}`, gaps, use cases outside every journey stage, stray generated fields, localized field keys, and `notes` fields that have grown into design content. Triggers include "validate use cases", "lint use cases", "use-cases.md をチェック", "UCの整合を確認", or after uneri-skills:udd-add. Reports only (does not edit). A later version may delegate to a dedicated trace tool. Output language follows `.uneri.json`.
