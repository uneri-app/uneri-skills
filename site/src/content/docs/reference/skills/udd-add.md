---
title: "/uneri-skills:udd-add"
description: "Append one use case with an auto-numbered, immutable ID"
---

Append one use case with an auto-numbered, immutable ID.
Part of: UDD: find and write use cases. See [all skills](./).

## Usage

```text
/uneri-skills:udd-add
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Use when adding a new use case to an existing `.kiro/uneri/use-cases.md` — appends one `UC-{CTX}-NNN` entry with auto-numbering, a validated `actor`, and optional `realizes`/`aggregates`. Triggers include "add a use case", "新しいユースケースを追加", "UCを追記", or after uneri-skills:udd-init when the list needs entries. NOT for creating the file (use uneri-skills:udd-init) or for non-functional requirements (those go to steering/spec).
