---
title: How big is one use case
description: The size rules that make use cases countable, how they differ from user stories, and how to find them.
---

uneri counts work in use cases, so the **size of one use case has to stay the same everywhere**. If one use case can be three weeks and another three minutes, counting them tells you nothing.

This page covers what one use case is, and how to find them.

## The unit

> **1 use case = 1 spec = 1 issue**

A use case is **one goal that one actor achieves in one sitting**. It becomes one set of requirements, design and tasks (one spec), and ties to one issue.
It has an ID like `UC-<CTX>-NNN`, so you can trace it to its spec and its pull requests.

### Where the term comes from

"Use case" here is the established requirements-engineering term, not a new one. Ivar Jacobson introduced use cases in the late 1980s, and Alistair Cockburn's *Writing Effective Use Cases* (2001) describes goal levels. uneri uses his **user-goal level**: a goal one actor reaches in one sitting, neither a whole business process above it nor a single step below it.

It is also not the everyday English sense of "use case" ("what you can use this for"). When this site says use case, it always means one user goal, counted and given an ID.

### Back to basics

AI made writing code cheap, so the hard part moved to deciding what to build and knowing when it is done. Those are old problems with old answers, and the use case is one of them.

Other spec-driven tools also apply long-standing practice to AI-written code. Among the seven we compared in November 2026 (cc-sdd, Spec Kit, OpenSpec, Kiro, BMAD, Tessl and Traycer), none fixes one size for every item in the list or counts the items as progress; the unit is a feature, a component boundary, or a story inside a spec. uneri cuts along the user goal, because that is the unit whose count we found to mean progress.

## Size rules

| Rule             | Meaning                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Name             | A verb phrase: "the actor does something". One actor and one goal per use case.                                         |
| Fits in one spec | If requirements, design and tasks fit in one set, the size is right. If you need two or more, split it.                 |
| Too small        | A part such as "log in" is not a use case on its own. Fold it into the goal it serves.                                  |
| Too big          | If it bundles several goals, split it. A big use case is fine if it is still one goal and fits in one spec.             |
| Different actor  | The same feature with a different actor is a different use case (for example, *sending* and *accepting* an invitation). |

Scenarios (what happens when it works, and when it does not) are not written in the list of use cases.
They change often and are tied to design, so you write them in the requirements when you turn a use case into a spec.
Non-functional requirements such as performance and security are not use cases either.

## How this differs from user stories

Stories and use cases are both ways to describe what a user wants. uneri chooses use cases for one reason: **a use case has a size rule that keeps its size the same, so the count means something.** In our experience a user story's size is up to the team, which is what makes story points necessary.

|                | User story                            | Use case                                   |
| -------------- | ------------------------------------- | ------------------------------------------ |
| Size           | Small and variable                    | The size of a user goal, so it stays fixed |
| When you count | The count has no stable meaning       | The count is comparable                    |
| Where it fits  | A unit for negotiating implementation | The unit of a spec, an issue and tasks     |

Stories are not bad. To count something as progress, the items have to be the same size.

## What counts as progress

Progress is **implemented use cases out of active use cases**. A use case is *implemented* when its spec has passed `/uneri-skills:sdd-validate-impl`
with a GO. A use case you no longer pursue is marked `deprecated:` and **left out of both numbers**, so dropping a goal does not lower the rate.
`/uneri-skills:sdd-trace` reports the count.

## Finding use cases: EventStorming, applied after the fact

Working backwards from a list of APIs misses use cases, because APIs sit on the *how* side.
uneri starts from the domain instead, with a light EventStorming inside `/uneri-skills:udd-init`.

1. Write down **aggregates, commands and events**. (For example: a tenant, "open a tenant", "a tenant was opened".)
2. Add **actors**, policies, read models and external systems.
3. Save the result in `domain-model.md`, `actors.md` and `glossary.md`.
4. Use it to write use cases with `/uneri-skills:udd-add`.

In a project that already has code, do the same thing **retrospectively**, from the database schema, the APIs and the design documents.

Names for aggregates, commands, events and actors are a **pair: a name in your language plus an English identifier (PascalCase)**.
The English identifier becomes the class and event names in code, so names do not drift.

## What to read next

- [Quick start](../../getting-started/first-run/): from `/uneri-skills:udd-init` to your first use case.
- [UDD and SDD](../udd-sdd/): the two methods, and the names of the artifacts.
- [Workflow](../workflow/): from use case to implementation.
