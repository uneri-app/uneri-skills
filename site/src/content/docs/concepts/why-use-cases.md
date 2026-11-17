---
title: Why use cases
description: The problem uneri starts from, and why the use case is the unit of work.
---

When building large server-side applications with teams, the hardest question is always: *where are we in the whole, and how far along are we?*
Counting epics, story points or API endpoints never answered it. With several people on the work, those units are not the same size, and they are
not what the user cares about. AI is now a member of that team, not a tool outside it, so people and AI need one shared unit to split the work and to say
how far along it is.

AI made writing code cheap. It did not make it cheap to decide what to build, or to know when it is done. Those are old problems, and they have old
answers. uneri goes back to basics: the use case.

## The unit

uneri fixes the unit. **One use case is one goal that one actor achieves in one sitting.** This is the *user-goal level* of use cases as Alistair Cockburn
describes it (*Writing Effective Use Cases*). How big that is in practice is in [How big is a use case?](../use-case-granularity/).

> **1 use case = 1 spec = 1 issue**

Each use case gets a stable ID (`UC-<CTX>-NNN`) that follows it through its spec, its tasks and its pull requests, so you can trace a requirement, a task or
a pull request back to the goal it serves. How the ID reaches GitHub is in [Labels and traceability](../labels/).

## What this claims, and what it does not

Because every item is the same kind of thing, the number of use cases you have finished can become a measure of progress you can say out loud. That is the
author's experience from building a product this way. Others have not yet reproduced it, so treat it as a claim to test, and tell us where it breaks.
