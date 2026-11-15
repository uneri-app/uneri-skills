---
title: "/uneri-skills:udd-validate"
description: "Use when checking a `.kiro/uneri/use-cases.md` for integrity — a read-only, Markdown-only validation (lint-style, no deps) reporting UC-ID duplicates, band/section violations, a missing `actor`, unregistered actors, dangling `realizes`/`aggregates`, multiple `{CTX}`, gaps, use cases outside every journey stage, stray generated fields, localized field keys, and `notes` fields that have grown into design content. Triggers include \"validate use cases\", \"lint use cases\", \"use-cases.md をチェック\", \"UCの整合を確認\", or after uneri-skills:udd-add. Reports only (does not edit). A later version may delegate to a dedicated trace tool. Output language follows `.uneri.json`."
---

Use when checking a `.kiro/uneri/use-cases.md` for integrity — a read-only, Markdown-only validation (lint-style, no deps) reporting UC-ID duplicates, band/section violations, a missing `actor`, unregistered actors, dangling `realizes`/`aggregates`, multiple `{CTX}`, gaps, use cases outside every journey stage, stray generated fields, localized field keys, and `notes` fields that have grown into design content. Triggers include "validate use cases", "lint use cases", "use-cases.md をチェック", "UCの整合を確認", or after uneri-skills:udd-add. Reports only (does not edit). A later version may delegate to a dedicated trace tool. Output language follows `.uneri.json`.

## 使い方

```text
/uneri-skills:udd-validate
```
