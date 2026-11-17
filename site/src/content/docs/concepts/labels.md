---
title: Labels and traceability
description: How GitHub labels tie issues and pull requests to a use case, so work can be found and counted by use case.
---

A use case has a stable ID, `UC-<CTX>-NNN`. The ID is what ties a use case to everything that follows from it. In the repository it is `traces_uc`
in the spec's `spec.json`. On GitHub it is a **label** with the same name, put on the use case's issue and on every pull request that carries its work.

## Why labels

- **One key, readable by anything.** A label is not prose. Anyone, or any tool that can read GitHub, can list the work of one use case without
  parsing titles or descriptions: your own scripts, dashboards, or other systems that read GitHub.
- **Stable.** The ID does not change when the title does. That is why a pull request title carries **no** ID: it follows your project's own title
  convention, and the label is the key.
- **Countable.** One use case is one unit, so "use cases finished out of use cases active" is a number you can compute from the labels and the specs.

```bash
gh issue list --label UC-SHP-001 --state all   # the use case's issue
gh pr list    --label UC-SHP-001 --state all   # every pull request that did its work
```

## The labels

| Label                     | Put on                                                         | Meaning                                                                                                    |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `UC-<CTX>-NNN`            | The use case's issue and the pull requests that carry its work | This is work for that use case. One label per use case; a pull request for several use cases carries each. |
| `bug`, `enabler`, `chore` | Issues and pull requests that **no use case owns**             | The kind of work. Exactly one kind label. Never together with a `UC-` label.                               |

- A **use-case label wins.** An issue with a `UC-` label is that use case's issue, and any kind label on it is removed.
- A bug found in a use case's feature is still a `bug`. Name the use case in the body (`related: UC-SHP-008`) instead of labelling it.
- The issue body repeats the ID as `traces: UC-SHP-001`, for readers and for tools that read the body.

## How the skills apply them

- [`pr-upsert`](../../reference/skills/pr-upsert/) and [`issue-upsert`](../../reference/skills/issue-upsert/) take the label from `spec.json` and pass it to
  `gh` **when the pull request or issue is created**, so one is never opened unlabelled. If the label does not exist yet, they create it
  (`gh label create`, a name and the description "Use case UC-<CTX>-NNN") before using it, and reuse an existing label as it is.
- Both show the exact `gh` command and wait for your confirmation before they write to GitHub.
- Nothing stops a `gh pr create` typed by hand with no label: the plugin ships no hook. Ask Claude to open the pull request through `pr-upsert`
  so it is labelled.
- `issue-upsert` also keeps an **implementation record** in a use case's issue: the pull requests that did the work (linked to the issue, or labelled with the use case).

## Using it yourself

If you create issues or pull requests by hand, apply the same labels and the same rules. Everything above then works for them too, including the
safety net and the lists in `gh`.
