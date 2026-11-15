---
title: Install
description: Add the uneri plugin to Claude Code.
---

Run these two commands in Claude Code:

```text
/plugin marketplace add uneri-app/uneri-skills
/plugin install uneri-skills@uneri-app
```

Skills are available as `/uneri-skills:<name>` (for example `/uneri-skills:udd-init`).

## Update

The installed plugin only updates when its version changes.

```bash
claude plugin marketplace update uneri-app
claude plugin update uneri-skills@uneri-app
```

Restart Claude Code after updating.

## Try a local checkout

```bash
claude --plugin-dir /path/to/uneri-skills/plugins/uneri-skills
```
