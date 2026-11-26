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

`/plugin install` opens a panel where you choose a scope. **User** scope installs uneri for you, in every project.

## Share with a team

To share uneri with a team, run these in the repository root and commit `.claude/settings.json`:

```bash
claude plugin marketplace add uneri-app/uneri-skills --scope project
claude plugin install uneri-skills@uneri-app --scope project
```

This enables the plugin for your teammates but does not download it.
Each teammate does this once per clone: start `claude` in the repository, accept the trust prompt, then run:

```bash
claude plugin install uneri-skills@uneri-app --scope project
```

Then run `/reload-plugins` in any open session, or restart Claude Code.

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
