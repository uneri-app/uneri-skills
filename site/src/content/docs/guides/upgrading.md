---
title: Upgrading and compatibility
description: How to update the plugin, what stays compatible, and where changes are announced.
---

## Update

The installed plugin only changes when its version changes.

```bash
claude plugin marketplace update uneri-app
claude plugin update uneri-skills@uneri-app
```

Restart Claude Code afterwards.

## What stays compatible

| Kept compatible during 0.x                                                                                                  | May still change                        |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| The file formats: [`use-cases.md`](../../reference/use-cases-contract/) and [`spec.json`](../../reference/spec-json-phase/) | The wording and the steps of the skills |
| Existing `UC-<CTX>-NNN` IDs and specs under `.kiro/specs/`                                                                  | Which skill asks which question         |

A change to a file format is announced in the [changelog](../../changelog/) with a **Migration** note, and it moves the minor version.
Specs and use cases you have already written stay valid input.

## Versions and the changelog

- A **minor** version (0.8.0, 0.9.0 …) is a milestone and has its own changelog section.
- A **patch** version (0.8.1 …) is a small fix and has no section of its own; its GitHub release says which minor it belongs to.
- The changelog on this site lists the published minors only.

## If something no longer works

Open an issue on [GitHub](https://github.com/uneri-app/uneri-skills/issues) with the plugin version (`claude plugin list`) and the skill you ran.
