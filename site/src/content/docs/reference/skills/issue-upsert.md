---
title: "/uneri-skills:issue-upsert"
description: "\"Use to create-or-update one GitHub Issue with the label that says what it is for: the Issue for one use case (`UC-{CTX}-NNN`, UC label; update the placeholder's body to a readable summary after `/uneri-skills:sdd-design`, or create it via `gh` when none exists) or a non-UC Issue (`bug` / `enabler` / `chore`, kind label). Requires `gh` and a GitHub remote. Triggers include \\\"update the issue for UC-…\\\", \\\"UCのIssue本文を読める形に更新\\\", \\\"UCをIssue化/起票\\\", \\\"file a bug\\\", \\\"バグを起票\\\", \\\"enablerのIssueを作って\\\". NOT for creating specs (that is uneri-skills:sdd-init). Output language follows `.uneri.json`.\""
---

"Use to create-or-update one GitHub Issue with the label that says what it is for: the Issue for one use case (`UC-{CTX}-NNN`, UC label; update the placeholder's body to a readable summary after `/uneri-skills:sdd-design`, or create it via `gh` when none exists) or a non-UC Issue (`bug` / `enabler` / `chore`, kind label). Requires `gh` and a GitHub remote. Triggers include \"update the issue for UC-…\", \"UCのIssue本文を読める形に更新\", \"UCをIssue化/起票\", \"file a bug\", \"バグを起票\", \"enablerのIssueを作って\". NOT for creating specs (that is uneri-skills:sdd-init). Output language follows `.uneri.json`."

## 使い方

```text
/uneri-skills:issue-upsert
```
