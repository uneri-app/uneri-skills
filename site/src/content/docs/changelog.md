---
title: "Changelog"
---

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
