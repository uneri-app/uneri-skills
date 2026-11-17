---
title: "/uneri-skills:sdd-init"
description: "Seed a spec from one use case"
---

Seed a spec from one use case.
Part of: SDD: from spec to implementation. See [all skills](./).

## Usage

```text
/uneri-skills:sdd-init
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Use when turning one use case (`UC-{CTX}-NNN`) from `.kiro/uneri/use-cases.md` into a spec — reads the UC, creates `.kiro/specs/{NNN-slug}/`, and writes `spec.json` seeded with `traces_uc`. Checks first whether a spec already traces this UC and hands off to the right next step instead of creating a duplicate. First step of the /uneri-skills:sdd-* planning workflow (requirements → clarify → design → tasks). Local-only (no `gh`, no MCP). Triggers include "turn UC into a spec", "UCをspec化", "start a spec for UC-…", "spec-init". Output language follows `.uneri.json`.
