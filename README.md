# uneri

**Count your work in use cases, not story points.**

uneri is a Claude Code plugin for use-case-driven development (UDD) and spec-driven development (SDD).
It turns each use case into one spec (requirements, design, tasks), keeps that spec as a living document in your repository,
and carries it through TDD implementation to a labelled pull request. Because every item is the same kind of thing, the number of
use cases you have finished can become a measure of progress you can say out loud.

> **Public beta (0.x).** The file formats (`use-cases.md`, `spec.json`) are kept compatible; the wording and steps of the skills may still change.
> That counting use cases measures progress is the author's experience from building a product this way. Others have not yet reproduced it, so treat it as a claim to test, and tell us where it breaks.
> Questions and ideas go to [Discussions](https://github.com/uneri-app/uneri-skills/discussions); bugs and changes to existing skills go to [Issues](https://github.com/uneri-app/uneri-skills/issues). See [CONTRIBUTING](https://github.com/uneri-app/uneri-skills/blob/main/CONTRIBUTING.md).

## The problem

When building large server-side applications with teams, the hardest question was always: *where are we in the whole, and how far along are we?*
Counting epics, story points or API endpoints never answered it: with several people on the work, those units are not the same size, and they are not what the user cares about.
AI is now a member of that team, not a tool outside it, so people and AI need one shared unit to split the work and to say how far along it is.

AI made writing code cheap. It did not make it cheap to decide what to build, or to know when it is done. Those are old problems, and they have old answers. uneri goes back to basics: the use case.

uneri fixes the unit. **One use case is one goal that one actor achieves in one sitting**. This is the *user-goal level* of use cases as Alistair Cockburn describes it (*Writing Effective Use Cases*, building on Ivar Jacobson's work), not the everyday sense of "a way to use the product". And:

> **1 use case = 1 spec = 1 issue**

Each use case gets a stable ID (`UC-<CTX>-NNN`) that follows it through its spec, its tasks and its pull requests, so you can trace a requirement, a task or a pull request back to the goal it serves.

## Install

```text
/plugin marketplace add uneri-app/uneri-skills
/plugin install uneri-skills@uneri-app
```

Skills are namespaced: `/uneri-skills:udd-init`, `/uneri-skills:sdd-init`, and so on. Run `/reload-plugins` after installing.
To try a local checkout without a marketplace: `claude --plugin-dir /path/to/uneri-skills/plugins/uneri-skills`.

`/plugin install` opens a panel where you choose a scope. **User** scope installs uneri for you, in every project.

To share it with a team, run these in the repository root and commit `.claude/settings.json`:

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

The installed plugin only changes when its version changes.

```bash
claude plugin marketplace update uneri-app
claude plugin update uneri-skills@uneri-app
```

Restart Claude Code afterwards. What stays compatible between versions is in the [upgrading guide](https://uneri-app.github.io/uneri-skills/guides/upgrading/).

## Quick start

```text
/uneri-skills:steering --lang en        # language, product / tech / structure (drafted from your code)
/uneri-skills:udd-init                  # domain discovery, use-cases.md
/uneri-skills:udd-add                   # add your first use case
/uneri-skills:sdd-init                  # turn it into a spec
/uneri-skills:sdd-requirements → /uneri-skills:sdd-clarify → /uneri-skills:sdd-design → /uneri-skills:sdd-tasks
/uneri-skills:sdd-impl                  # implement the approved tasks with TDD
/uneri-skills:sdd-validate-impl         # feature-level GO / NO-GO
/uneri-skills:pr-upsert                 # open a labelled pull request
```

Everything is plain Markdown and JSON under `.kiro/uneri/`, `.kiro/specs/` and `.kiro/steering/`, so nothing is hidden and you can audit it any time with `/uneri-skills:sdd-trace`.
The `--lang` setting applies to the whole repository and is kept in `.uneri.json`.

Full documentation, including a worked example: **<https://uneri-app.github.io/uneri-skills/>**

## What is in the plugin

### UDD: find and write use cases

| Skill                        | What it does                                                         |
| ---------------------------- | -------------------------------------------------------------------- |
| `/uneri-skills:udd-init`     | Light EventStorming and the `use-cases.md` scaffold                  |
| `/uneri-skills:udd-add`      | Append one use case with an auto-numbered, immutable ID              |
| `/uneri-skills:udd-validate` | Check `use-cases.md` for duplicates, gaps and missing fields         |
| `/uneri-skills:udd-arrange`  | Reorder the use cases by the user's journey, without changing any ID |

### SDD: from spec to implementation

| Skill                               | What it does                                                                |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `/uneri-skills:sdd-init`            | Seed a spec from one use case                                               |
| `/uneri-skills:sdd-requirements`    | Generate EARS requirements from the use case's scenarios                    |
| `/uneri-skills:sdd-clarify`         | Surface ambiguities before design                                           |
| `/uneri-skills:sdd-design`          | Generate the design, with explicit in-scope and out-of-boundary commitments |
| `/uneri-skills:sdd-validate-design` | Review the design before implementation                                     |
| `/uneri-skills:sdd-validate-gap`    | Analyze the gap with an existing codebase (brownfield)                      |
| `/uneri-skills:sdd-tasks`           | Break the design into a checkbox task list                                  |
| `/uneri-skills:sdd-impl`            | Implement approved tasks with TDD and subagents                             |
| `/uneri-skills:sdd-validate-impl`   | GO / NO-GO gate after all tasks are implemented                             |
| `/uneri-skills:sdd-compact`         | Rewrite a spec to describe the present: fold history, fix drift             |
| `/uneri-skills:sdd-trace`           | Audit use case ↔ spec ↔ requirement ↔ task consistency, and count progress  |

### Cross-cutting

| Skill                             | What it does                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `/uneri-skills:steering`          | Project-wide steering docs (product, tech, structure)                            |
| `/uneri-skills:review`            | Review a task against its spec and boundaries                                    |
| `/uneri-skills:debug`             | Root-cause-first investigation                                                   |
| `/uneri-skills:verify-completion` | Verify a "done" claim with fresh evidence                                        |
| `/uneri-skills:issue-upsert`      | Create or update one GitHub issue (a use case's, or `bug` / `enabler` / `chore`) |
| `/uneri-skills:pr-upsert`         | Create or update the current branch's pull request, always labelled              |
| `/uneri-skills:adr`               | Draft, audit or consult Architecture Decision Records                            |

For an existing codebase, run `/uneri-skills:sdd-validate-gap` before `/uneri-skills:sdd-tasks`.
`/uneri-skills:sdd-design` offers `/uneri-skills:adr` when a decision outlives the spec; the spec keeps how, the ADR keeps why.
`/uneri-skills:review`, `/uneri-skills:debug` and `/uneri-skills:verify-completion` are called by `/uneri-skills:sdd-impl` for each task; you rarely run them by hand.

### What writes outside your files

Most skills only read and write local files. Three have side effects:

- **`/uneri-skills:sdd-impl`** writes source code, runs tests, dispatches subagents and makes git commits. It will not start until the tasks are approved, and then runs to the end.
- **`/uneri-skills:issue-upsert`** and **`/uneri-skills:pr-upsert`** write to GitHub through `gh`. They always show you the exact commands and wait for your confirmation before pushing or writing anything.

## About the labels

The labels tell what each pull request is for: a use case, a defect, planned technical work, or housekeeping.
They also let you filter the pull request list by use case. Nothing else depends on them.

## Roadmap

- **Now (0.x):** the full UDD → SDD backbone described above.

## Credits

The author's approach to use cases was shaped by Doug Rosenberg and Matt Stephens, *Use Case Driven Object Modeling with UML: Theory and Practice* (Apress, 2007).

The SDD skills are ported from the `kiro-*` skills of [cc-sdd](https://github.com/gotalab/cc-sdd) (MIT) and changed for use-case-driven development; they build on Kiro's spec-driven development. The cc-sdd copyright notice and license are in [`THIRD_PARTY_NOTICES.md`](plugins/uneri-skills/THIRD_PARTY_NOTICES.md). uneri's skills are self-contained and need no other plugin at runtime.

Kiro is a product of Amazon Web Services. uneri-skills follows its `.kiro/` directory layout and is not affiliated with, sponsored by or endorsed by Amazon Web Services or cc-sdd.

## License

MIT
