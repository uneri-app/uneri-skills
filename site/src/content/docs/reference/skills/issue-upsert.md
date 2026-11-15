---
title: "/uneri-skills:issue-upsert"
description: "Use to create-or-update one GitHub Issue with the label that says what it is for — either the Issue for one use case (`UC-{CTX}-NNN`, from `.kiro/uneri/use-cases.md` and its spec, UC label) or a non-UC Issue (`bug` / `enabler` / `chore`, kind label, never a UC label). For a UC: steady state = **update** an existing Issue's body to a human-readable summary of what the change cycle does after `/uneri-skills:sdd-design`, including an **implementation record** of the change cycle's PRs (Development ∪ UC-labelled PRs) (the Issue often already exists as a placeholder with only the UC-ID); **create** it via `gh` when none exists. Requires `gh` and a GitHub remote. Triggers include \"update the issue for UC-…\", \"UCのIssue本文を読める形に更新\", \"UCをIssue化/起票\", \"file a bug\", \"バグを起票\", \"enablerのIssueを作って\". NOT for creating specs (that is uneri-skills:sdd-init) and never writes anywhere but GitHub. Output language follows `.uneri.json`."
---

Use to create-or-update one GitHub Issue with the label that says what it is for — either the Issue for one use case (`UC-{CTX}-NNN`, from `.kiro/uneri/use-cases.md` and its spec, UC label) or a non-UC Issue (`bug` / `enabler` / `chore`, kind label, never a UC label). For a UC: steady state = **update** an existing Issue's body to a human-readable summary of what the change cycle does after `/uneri-skills:sdd-design`, including an **implementation record** of the change cycle's PRs (Development ∪ UC-labelled PRs) (the Issue often already exists as a placeholder with only the UC-ID); **create** it via `gh` when none exists. Requires `gh` and a GitHub remote. Triggers include "update the issue for UC-…", "UCのIssue本文を読める形に更新", "UCをIssue化/起票", "file a bug", "バグを起票", "enablerのIssueを作って". NOT for creating specs (that is uneri-skills:sdd-init) and never writes anywhere but GitHub. Output language follows `.uneri.json`.

## 使い方

```text
/uneri-skills:issue-upsert
```
