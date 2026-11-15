---
title: "/uneri-skills:pr-upsert"
description: "\"Use to create-or-update the GitHub Pull Request for the current branch, always with a label saying what it is for: the `UC-{CTX}-NNN` label for a use case's spec (`{feature-name}`), or `bug` / `enabler` / `chore` for a PR no UC owns. Requires `gh` and a GitHub remote; every write waits for the user's confirmation. Triggers include \\\"open a PR for this feature\\\", \\\"PRを作って/更新して\\\", \\\"このspecのPRを作って\\\", \\\"バグ修正のPRを作って\\\", \\\"PR upsert\\\". NOT for merging, requesting review, or linking Issues (that is `uneri-skills:issue-upsert`). Output language follows `.uneri.json`.\""
---

"Use to create-or-update the GitHub Pull Request for the current branch, always with a label saying what it is for: the `UC-{CTX}-NNN` label for a use case's spec (`{feature-name}`), or `bug` / `enabler` / `chore` for a PR no UC owns. Requires `gh` and a GitHub remote; every write waits for the user's confirmation. Triggers include \"open a PR for this feature\", \"PRを作って/更新して\", \"このspecのPRを作って\", \"バグ修正のPRを作って\", \"PR upsert\". NOT for merging, requesting review, or linking Issues (that is `uneri-skills:issue-upsert`). Output language follows `.uneri.json`."

## 使い方

```text
/uneri-skills:pr-upsert <feature-name> | <bug|enabler|chore> ["<summary>"]
```
