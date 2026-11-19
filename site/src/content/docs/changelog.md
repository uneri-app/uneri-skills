---
title: "Changelog"
---

## 0.8.0

The plugin now passes the plugin directory's pre-submission checks without blocking issues. Nothing in the file formats
(`use-cases.md`, `spec.json`) changes.

### Removed

- **The plugin ships no hooks and no scripts.** The directory accepts command hooks and scripts only from Verified organizations, so the two hooks
  and the `adr` checker script are gone. The session-start summary of the workflow and of each spec's status no longer appears; ask Claude for the
  status (`/uneri-skills:sdd-trace`). A `gh pr create` typed by hand is no longer stopped when it carries no label: open pull requests through
  `/uneri-skills:pr-upsert`, which always labels. The `adr` skill now does its mechanical checks by reading the files.

### Changed

- **Skills no longer pre-approve `Bash`, `Write`, `Edit`, `Agent` or the web tools.** Eight skills (`debug`, `review`, `adr`,
  `sdd-validate-design`, `sdd-validate-gap`, `sdd-validate-impl`, `sdd-impl`, `verify-completion`) declare `allowed-tools: Read, Grep, Glob`
  only. Depending on your permission settings, Claude Code may now ask before a skill runs a command or writes a file, which can interrupt
  a long `sdd-impl` run; allow the commands you trust in your own settings.
- The `description` of `issue-upsert` and `pr-upsert` is shorter (about 560 characters instead of about 1,000), so it takes less of the skill list.
- The plugin ships an icon (`.claude-plugin/icon.png`), and the plugin README lists its requirements.

### Added

- Documentation: [Permissions](https://uneri-app.github.io/uneri-skills/guides/permissions/) (which skills run commands or write files, and how to allow what you trust),
  [Why use cases](https://uneri-app.github.io/uneri-skills/concepts/why-use-cases/) (the problem uneri starts from), [Credits and licence](https://uneri-app.github.io/uneri-skills/reference/credits/),
  a one-page [Cheatsheet](https://uneri-app.github.io/uneri-skills/reference/cheatsheet/) (the order, what each skill produces and runs, the gates; print it landscape or save it as a PDF),
  and a skills reference that groups the skills into UDD, SDD and cross-cutting, explains the split, and gives every skill a one-line summary
  (each skill's page keeps its description for Claude under "When Claude picks it"). The skills page headings are in English.
  [Labels and traceability](https://uneri-app.github.io/uneri-skills/concepts/labels/) (how `UC-<CTX>-NNN`, `bug`, `enabler` and `chore` labels tie issues and pull requests to a use case),
  [Upgrading and compatibility](https://uneri-app.github.io/uneri-skills/guides/upgrading/) (what stays compatible, versions and the changelog), and a
  home page that says what you get. The home page title no longer repeats the site name.

### Fixed

- The documentation site is published to GitHub Pages. Its build workflow now uses Node 22 (the site generator needs Node 22.23 or later; the
  action's default, Node 20, stopped the build), and the link check no longer passes an option that the current link checker rejects.

## 0.7.0

The first public release, a public beta. The file formats (`use-cases.md`, `spec.json`) are kept compatible; the wording and steps of the
skills may still change.

### What it does

- **Use-case-driven development (UDD):** `udd-init` (language, light EventStorming, the `use-cases.md` scaffold), `udd-add`,
  `udd-validate`, `udd-arrange` (order the list by the user's journey, moving entries only) and the `udd-authoring` knowledge skill.
- **Spec-driven development (SDD), one use case = one spec:** `sdd-init`, `sdd-requirements`, `sdd-clarify`, `sdd-design`,
  `sdd-validate-design`, `sdd-tasks`, `sdd-impl` (TDD with subagents), `sdd-validate-impl` (GO / NO-GO), `sdd-trace`, and
  `sdd-validate-gap` for an existing codebase.
- **Cross-cutting:** `steering`, `review`, `debug`, `verify-completion`, `adr` (draft, audit and consult decision records),
  `issue-upsert` and `pr-upsert` (the pull request is always labelled).
- **Open decisions are recorded before a design is approved.** `sdd-design` lists them in a `## Decisions` section of `design.md`
  (options, a recommendation, a status) and does not approve the design while one is open, unless the user delegates the decisions.
- **Progress is counted in use cases.** `sdd-trace` reports implemented use cases out of active ones; a use case marked
  `deprecated:` is left out of both numbers.
- **Two hooks**, active only in a project that has `.uneri.json`: a session-start summary of the workflow and the status of each spec,
  and a check that stops a `gh pr create` that carries none of the labels `UC-<CTX>-NNN`, `bug`, `enabler` or `chore`.
- A use case needs an `actor` and nothing else; there is no size field. A use case that nothing refers to may be deleted, and one that is
  no longer pursued is marked `deprecated:`.

Install: `/plugin marketplace add uneri-app/uneri-skills`, then `/plugin install uneri-skills@uneri-app`, then `/reload-plugins`.

## Before 0.7.0

Earlier versions were development builds and were not published.
