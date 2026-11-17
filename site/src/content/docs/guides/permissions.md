---
title: Permissions
description: Which skills run commands or write files, and how to allow what you trust.
---

The skills do not pre-approve `Bash`, `Write`, `Edit`, subagents or the web tools. Eight skills declare only `Read`, `Grep` and `Glob`
(`debug`, `review`, `adr`, `sdd-validate-design`, `sdd-validate-gap`, `sdd-validate-impl`, `sdd-impl`, `verify-completion`), and
`issue-upsert` and `pr-upsert` declare nothing. A tool a skill does not list stays available, and your own Claude Code permission settings decide
whether it runs, so Claude Code may ask before a skill runs a command or writes a file.

## What to expect

| Skill                                                       | Commands                                          | Files                                                |
| ----------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `sdd-impl`, `sdd-validate-impl`                             | Yes: your test runner and checks, and `git`       | Your source, tests and spec files                    |
| `debug`, `review`, `verify-completion`                      | Yes: `git`, your test runner                      | None                                                 |
| `adr`                                                       | None                                              | ADR files                                            |
| `sdd-validate-gap`                                          | None                                              | `research.md` in the spec folder; may search the web |
| `sdd-validate-design`                                       | None                                              | None (read-only)                                     |
| `udd-*`, `steering`, `sdd-init` to `sdd-tasks`, `sdd-trace` | None                                              | Markdown and JSON under `.kiro/`                     |
| `issue-upsert`, `pr-upsert`                                 | `gh` and `git push`, each after your confirmation | None                                                 |

## Allowing what you trust

A long `sdd-impl` run is interrupted by every prompt. If you trust the commands your project uses, allow them once in a settings file:

- `.claude/settings.json`: shared with everyone who works in the repository (commit it).
- `.claude/settings.local.json`: only you, in this project.

The easiest way is to answer "Yes, and don't ask again" when Claude Code asks; it saves the rule to `.claude/settings.local.json`.
To write the rules yourself, put the program and its subcommand first and a `*` after them. Replace the test command with yours:

```json
{
  "permissions": {
    "allow": [
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(npm test *)"
    ]
  }
}
```

- The space before `*` matters: `Bash(git diff *)` does not match `git diffstat`. A trailing `:*` (`Bash(git diff:*)`) means the same.
- Allow only commands you understand. These rules match the start of a command; they are a convenience, not a security boundary.
- `git push` and `gh` are left out on purpose. They write outside your machine, and `issue-upsert` and `pr-upsert` ask you to confirm the exact
  command anyway.

How rules combine, and every other option, is in the Claude Code documentation on permissions and settings.
