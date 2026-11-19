# Privacy

uneri-skills is a set of Markdown skills and templates for Claude Code. It has no server, no account, no telemetry and no analytics. The plugin collects no data and keeps none.

## What it reads and writes

On your machine, in your repository only:

- Most skills read and write Markdown and JSON files under `.kiro/uneri/`, `.kiro/specs/` and `.kiro/steering/`, and `.uneri.json`.
- `sdd-impl` writes source code, runs your tests and checks, dispatches subagents and makes git commits, at your direction and only after you approve the tasks. It runs the commands your project already defines; it adds none of its own.
- `adr` reads and writes ADR files.

These files stay where you put them. The plugin does not copy them anywhere.

## What it sends

The plugin makes no network request of its own, and it has no hooks or scripts.

- **GitHub.** `issue-upsert` and `pr-upsert` use your own GitHub CLI (`gh`) to create or update an issue or a pull request. They show you the exact commands and wait for your confirmation first. What you send there (titles, descriptions, labels) is handled by GitHub under your GitHub account and GitHub's terms.
- **Web research.** `sdd-validate-gap`, `debug` and the debugger step of `sdd-impl` may ask Claude to search the web or fetch a page (for example, a library's documentation). That is done by Claude Code with its web tools, under your permission settings; the search terms and the pages you allow leave your machine that way.
- **Claude.** What you and the skills write in a session is processed by Claude under your agreement with Anthropic. The plugin adds nothing to that, and it does not read your credentials.

## What it does not collect

The plugin does not collect, log, copy or transmit any of the following, and it has no code that could:

- your source code or the contents of any file in your repository (it reads and edits them in place, on your machine);
- your prompts, conversations, use cases, specs, designs or steering documents;
- credentials: tokens, keys, passwords, environment variables, or your `gh` login (the GitHub CLI uses its own login; the plugin never reads it);
- personal information such as names, email addresses or your machine's identity;
- usage information: no counts, no versions, no logs, no crash reports.

The one thing that leaves your machine is what a session already sends to Claude (the "Claude" item above), and what you confirm yourself: a `gh` command, or a web search you allow.

## Retention

None. The plugin holds no data. Anything kept is in your files, in your git history, on GitHub if you pushed it there, or in Claude Code's own session history under your settings.

## Children

uneri-skills is a developer tool and is not directed at users under 18.

## Changes and questions

A change to this policy ships with a plugin version, and the date below changes with it. Questions: open a [Discussion](https://github.com/uneri-app/uneri-skills/discussions/categories/q-a). A security problem: see `SECURITY.md` in the repository root.

Last updated: 2026-11-17.
