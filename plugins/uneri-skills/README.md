# uneri-skills

A Claude Code plugin for use-case-driven development (UDD) and spec-driven development (SDD). It turns each use case into one spec (requirements, design, tasks), keeps that spec as a living document in your repository, and carries it through TDD implementation to a labelled pull request. Because every item is the same kind of thing, the number of use cases you have finished can become a measure of progress.

This is a public beta (0.x). The file formats (`use-cases.md`, `spec.json`) are kept compatible; the wording and steps of the skills may still change. Full documentation: <https://uneri-app.github.io/uneri-skills/>. Source and issues: <https://github.com/uneri-app/uneri-skills>.

## Install

```text
/plugin marketplace add uneri-app/uneri-skills
/plugin install uneri-skills@uneri-app
/reload-plugins
```

Skills are namespaced: `/uneri-skills:udd-init`, `/uneri-skills:sdd-init`, and so on.

## What is in it

- **UDD:** `udd-init`, `udd-add`, `udd-validate`, `udd-arrange`, and the `udd-authoring` knowledge skill.
- **SDD:** `sdd-init`, `sdd-requirements`, `sdd-clarify`, `sdd-design`, `sdd-validate-design`, `sdd-validate-gap`, `sdd-tasks`, `sdd-impl`, `sdd-validate-impl`, `sdd-trace` (which also counts progress: implemented use cases out of active ones).
- **Cross-cutting:** `steering`, `review`, `debug`, `verify-completion`, `adr`, `issue-upsert`, `pr-upsert`.

## Requirements

- **The GitHub CLI (`gh`), signed in,** is needed only by `issue-upsert` and `pr-upsert`, and only for the GitHub remote they write to. The other skills work without it.

## What it runs, writes and sends

Nothing is hidden. The plugin has no dependencies, makes no network requests of its own, and collects no data.

- **Most skills** read and write Markdown and JSON files in your repository, under `.kiro/uneri/`, `.kiro/specs/` and `.kiro/steering/`.
- **`sdd-impl`** writes source code, runs your tests, dispatches subagents and makes git commits. It does not start until the tasks are approved.
- **`issue-upsert` and `pr-upsert`** call the GitHub CLI (`gh`) to create or update an issue or a pull request. They show you the exact commands and wait for your confirmation before pushing or writing anything.
- **No hooks, no scripts.** The plugin is Markdown skills and templates only; it runs nothing of its own.

## Credits and license

The SDD skills are ported from the `kiro-*` skills of [cc-sdd](https://github.com/gotalab/cc-sdd) (MIT) and changed for use-case-driven development. The cc-sdd copyright notice and license are in `THIRD_PARTY_NOTICES.md`. uneri-skills is not affiliated with, sponsored by or endorsed by Amazon Web Services or cc-sdd. The plugin is released under the MIT license (`LICENSE`).
