---
title: "/uneri-skills:sdd-init"
description: "Use when turning one use case (`UC-{CTX}-NNN`) from `.kiro/uneri/use-cases.md` into a spec — reads the UC, creates `.kiro/specs/{NNN-slug}/`, and writes `spec.json` seeded with `traces_uc`. Checks first whether a spec already traces this UC and hands off to the right next step instead of creating a duplicate. First step of the /uneri-skills:sdd-* planning workflow (requirements → clarify → design → tasks). Local-only (no `gh`, no MCP). Triggers include \"turn UC into a spec\", \"UCをspec化\", \"start a spec for UC-…\", \"spec-init\". Output language follows `.uneri.json`."
---

Use when turning one use case (`UC-{CTX}-NNN`) from `.kiro/uneri/use-cases.md` into a spec — reads the UC, creates `.kiro/specs/{NNN-slug}/`, and writes `spec.json` seeded with `traces_uc`. Checks first whether a spec already traces this UC and hands off to the right next step instead of creating a duplicate. First step of the /uneri-skills:sdd-* planning workflow (requirements → clarify → design → tasks). Local-only (no `gh`, no MCP). Triggers include "turn UC into a spec", "UCをspec化", "start a spec for UC-…", "spec-init". Output language follows `.uneri.json`.

## 使い方

```text
/uneri-skills:sdd-init
```
