---
title: "/uneri-skills:pr-upsert"
description: "Use to create-or-update the GitHub Pull Request for the current branch, always carrying a label that says what the PR is for. **UC path** (`{feature-name}`): sourced from the spec (`.kiro/specs/{feature-name}/spec.json`, `tasks.md`, optionally `verification.md`) — draft while `spec.json.phase` is below `implemented`, ready-for-review once `sdd-validate-impl` reports GO, `UC-{CTX}-NNN` label. **Non-UC path** (`bug` / `enabler` / `chore`): a PR no UC owns, kind label, never a UC label. The label is passed to `gh pr create` itself, so a PR is never opened unlabeled. Requires `gh` and a GitHub remote; refuses to run on `main`; every write waits for the user's confirmation. Triggers include \"open a PR for this feature\", \"PRを作って/更新して\", \"このspecのPRを作って\", \"バグ修正のPRを作って\", \"PR upsert\". NOT for merging, requesting review, or linking Issues (that is `uneri-skills:issue-upsert`). Output language follows `.uneri.json`."
---

Use to create-or-update the GitHub Pull Request for the current branch, always carrying a label that says what the PR is for. **UC path** (`{feature-name}`): sourced from the spec (`.kiro/specs/{feature-name}/spec.json`, `tasks.md`, optionally `verification.md`) — draft while `spec.json.phase` is below `implemented`, ready-for-review once `sdd-validate-impl` reports GO, `UC-{CTX}-NNN` label. **Non-UC path** (`bug` / `enabler` / `chore`): a PR no UC owns, kind label, never a UC label. The label is passed to `gh pr create` itself, so a PR is never opened unlabeled. Requires `gh` and a GitHub remote; refuses to run on `main`; every write waits for the user's confirmation. Triggers include "open a PR for this feature", "PRを作って/更新して", "このspecのPRを作って", "バグ修正のPRを作って", "PR upsert". NOT for merging, requesting review, or linking Issues (that is `uneri-skills:issue-upsert`). Output language follows `.uneri.json`.

## 使い方

```text
/uneri-skills:pr-upsert <feature-name> | <bug|enabler|chore> ["<summary>"]
```
