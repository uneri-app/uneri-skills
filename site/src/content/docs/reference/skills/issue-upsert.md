---
title: "/uneri-skills:issue-upsert"
description: "Create or update one GitHub issue (a use case's, or `bug` / `enabler` / `chore`)"
---

Create or update one GitHub issue (a use case's, or `bug` / `enabler` / `chore`).
Part of: Cross-cutting. See [all skills](./).

## Usage

```text
/uneri-skills:issue-upsert
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> "Use to create-or-update one GitHub Issue with the label that says what it is for: the Issue for one use case (`UC-{CTX}-NNN`, UC label; fills the placeholder's body after `/uneri-skills:sdd-design`, or creates it via `gh` when none exists) or a non-UC Issue (`bug` / `enabler` / `chore`, kind label). Requires `gh` and a GitHub remote. Triggers include \"update the issue for UC-…\", \"create an Issue for this use case\", \"file a bug\", \"file an enabler Issue\". NOT for creating specs (that is uneri-skills:sdd-init)."
