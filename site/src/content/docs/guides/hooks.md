---
title: Hooks
description: What the plugin's two bundled hooks do.
---

Both hooks run only in a project that has a `.uneri.json`, and neither writes anything to your repository.

- **SessionStart**: injects a map of the UDD/SDD workflow and the current status of your specs into the session.
- **PreToolUse(Bash)**: blocks a `gh pr create` that carries none of the labels `UC-<CTX>-NNN`, `bug`, `enabler` or `chore`, and points you to `/uneri-skills:pr-upsert`.
