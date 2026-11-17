---
title: Hooks
description: What the plugin's two bundled hooks do, and what they never do.
---

Both hooks are plain Node scripts that use only the Node standard library, so Node.js must be on your `PATH`. They run only in a project that
has a `.uneri.json`, and neither writes anything to your repository or sends anything over the network.

## SessionStart

Adds a short, plain-text summary to the session:

- the project language and layout from `.uneri.json`;
- a map of the UDD and SDD workflow, so Claude uses the matching `/uneri-skills:*` skill;
- one line per spec, read from `.kiro/specs/*/spec.json` (and `services/*/.kiro/specs/*/spec.json` in a multi-context layout): its phase, which
  approvals are given, and the use case it traces.

## PreToolUse (Bash)

Stops a `gh pr create` that carries none of the labels `UC-<CTX>-NNN`, `bug`, `enabler` or `chore`, and points you to `/uneri-skills:pr-upsert`.

- It only blocks. It never approves a command, and it never rewrites one.
- Any other command passes through untouched, and so does a `gh pr create` in a project without `.uneri.json`.
- If it cannot read its input, it lets the command through rather than breaking the session.
