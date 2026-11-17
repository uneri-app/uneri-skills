---
title: "/uneri-skills:udd-arrange"
description: "Reorder the use cases by the user's journey, without changing any ID"
---

Reorder the use cases by the user's journey, without changing any ID.
Part of: UDD: find and write use cases. See [all skills](./).

## Usage

```text
/uneri-skills:udd-arrange
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> "Use when the use cases in a `.kiro/uneri/use-cases.md` are listed in the order they were added and you want them in a meaningful order — arranges the entries by the user's journey (the order an actor meets the goals), grouped under `<!-- journey: … -->` stage markers. Moves entries only: IDs, text and fields are never changed. Proposes the new order, shows every move, and writes only after approval. Triggers include \"arrange use cases\", \"reorder use cases\", \"ユースケースの並びを整理\", \"UCを意味のある順番に\", \"ユーザーの旅の順に並べて\". Local-file only. Output language follows `.uneri.json`."
