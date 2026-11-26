---
title: "/uneri-skills:sdd-compact"
description: "Rewrite a spec to describe the present: fold history, fix drift, make it self-contained"
---

Rewrite a spec to describe the present: fold history, fix drift, make it self-contained.
Part of: SDD: from spec to implementation. See [all skills](./).

## Usage

```text
/uneri-skills:sdd-compact <feature-name>
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Use when a spec's `requirements.md` or `design.md` has accumulated history (dated additions, appended clarification Q&A, retired or "withdrawn" text), has drifted from the implementation, or links to documents outside the spec directory — rewrites both files to describe the spec as it is now, and nothing else, keeping every ID other files refer to. Edits only those two files. Triggers include "compact the spec", "spec を整理", "経緯をまとめる", "実装とずれた spec を直す".
