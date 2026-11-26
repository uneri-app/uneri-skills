---
title: "/uneri-skills:sdd-impl"
description: "Implement approved tasks with TDD and subagents"
---

Implement approved tasks with TDD and subagents.
Part of: SDD: from spec to implementation. See [all skills](./).

## Usage

```text
/uneri-skills:sdd-impl <feature-name> [task-numbers]
```

## When Claude picks it

This is the skill's own description, which Claude reads to decide when to use it:

> Implement approved tasks using TDD with native subagent dispatch. Runs all pending tasks autonomously to the end, or selected tasks manually. Refuses to start until the spec's tasks are approved. Triggers include "implement this spec", "spec impl". Takes `{feature-name} [task-numbers]`.
