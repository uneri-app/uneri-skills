---
name: adr
description: Draft a new Architecture Decision Record (ADR), audit existing ones against the authoring conventions (status consistency, no progress or ticket numbers in the body, decision granularity, immutability), or consult them before changing code. Use when writing, reviewing, superseding, or accepting an ADR, when asked whether the ADRs are well written, or when about to make a change that an accepted ADR may govern.
allowed-tools: Read, Grep, Glob
argument-hint: "[draft <topic | spec:feature> | audit [--from NNNN] [NNNN...] | consult <area>]"
---

# uneri-skills:adr — draft, audit and consult Architecture Decision Records

Writes ADRs, audits them, and consults them, by one rule set: `references/adr-authoring.md` (rule IDs A-1 … G-2, MUST/SHOULD,
mechanical `M` or judgment `J`). Read it before doing any mode. Do not restate the rules from memory.

## Where things are

- **ADR directory**: never assume it. Look in this order and stop at the first hit: the project's steering or
  contributor docs, then `docs/adr`, `docs/adrs`, `docs/decisions`, `doc/adr`, `adr`, `decisions`. If none has ADR files,
  ask the user where they live; for a first ADR in `draft` mode, propose `docs/adr` and wait for a yes before creating it.
- **Existing conventions win**: match the project's file naming (`001-…` or `0001-…`), status notation (frontmatter,
  `Status:` line, or `## Status` section), and index format. Do not reformat existing ADRs to fit this skill.
- Index: `README.md` or `index.md` in that directory, if the project keeps one. Without an index, skip index rules.
- Language: the project's configured language (`.uneri.json` `lang`, else the language of the existing ADRs).
- New files: continue the existing numbering, appended in order with no gaps.

## How it is reached

Two entry points. In an SDD flow the second is the common one.

- **Directly**: the user asks to write, audit, or consult ADRs.
- **From design or review**: while a design is being written or reviewed, a decision turns up that outlives the spec.
  The calling step asks "does any decision here pass the *Spec or ADR?* test?" (a reviewer also flags a change that
  alters the architecture with no ADR behind it) and, if so, hands the decision to
  `draft` with the spec as the source (below). The human confirms before anything is written.

## Mode: draft

**Source.** When given a spec (`spec:<feature>`) or called from design/review, do not interview from scratch: the spec's
`design.md` and `research.md` already hold the context, the options considered, and the decision. Lift those; leave
the how in the spec (D-4); ask only for what is missing. After the ADR exists, add a link to it in the spec's design
and name the spec or use case by its stable ID in the ADR's References. Never copy the rationale into both.

0. **No ADR directory yet?** Ask before creating anything. With a yes, create it (default `docs/adr`), seed the index
   from `assets/index.md` as `README.md`, and put `assets/adr-template.md` there as `template.md` for manual use.
   Without a yes, create nothing and show the draft in the conversation only.
1. Read `references/adr-authoring.md`, the index, and the ADRs the topic touches (decisions it may replace or amend).
   First check "When an ADR is warranted"; if it is not, say so and stop (a code comment or PR description will do).
2. Ask only for what you cannot derive: the **actual problem in this project** (C-2), the options that were really
   considered, and the decision. Do not invent options or evidence; a premise needs a source and a date (C-1).
   Ask one question at a time. If anything in your picture was inferred rather than stated, show a short summary
   (title, trigger, constraints, options, lean, what is not decided) and let the human correct it before you write.
3. Check the boundary before writing (D-4): if swapping the mechanism would change the text, it is a spec or PR
   description, not the ADR. Put "what this ADR does not decide" and the delegate at the end of Decision (D-3).
4. If the decision implies follow-up work, hand it to the project's task mechanism (spec tasks, the issue tracker) and
   leave it out of the ADR (D-1). The ADR does not carry an action list.
   If it changes an earlier decision, **do not edit the old ADR's decision** (E-4). Write a new ADR that supersedes it;
   set the old one to `superseded` or `partially-superseded` and name the replaced decision numbers in both headers.
5. Start from `assets/adr-template.md`. Use the fixed English section headings (D-2: Context, Options, Decision, Consequences, Revisit conditions,
   References) and write the body in the project's language. Write the file with a single-value `status` in frontmatter (E-1/E-2) and the index row (title only, E-5).
   New ADRs start as `proposed`. `accepted` only after the human approves, and only with no open question left (G-1).
6. Show the draft and write the file only after the human approves it; if they decline, discard it and write nothing.
   Add the index row in the same change (E-3). Then run the checker (below) and fix every MUST before handing back. Then do the `J` pass for C, D-1, D-4, G, and read the draft against the failure patterns in the reference.

## Mode: audit

1. Run the checker. `--from NNNN` limits it to newer ADRs when older ones are grandfathered (existing ADRs predating
   a rule are not rewritten; their problems are reported, not auto-fixed).
2. For the files the user selects (or the newest ones by default), do the `J` pass by rule ID: C-1, C-2, C-3, D-1,
   D-3, D-4, E-4, F-1, G-1/G-2, using the failure patterns in the reference to explain what went wrong. Quote the
   offending line; do not quote it as a bad example in any file.
3. Report by rule ID with file and line, MUST before SHOULD. Propose fixes; apply them only when asked.
   Fixes that rewrite a decision are not fixes (E-4); they become a new ADR.

## Mode: consult

Use before changing code in an area that may be governed by a decision, or when asked "why is it done this way?".

1. Find the ADR directory and index. Scan titles and statuses; `accepted` ADRs are the active decisions.
   If there is no ADR directory, say so and offer to start one. If nothing matches the question, say so and offer to
   record the decision now ("Mode: draft"); do not invent an answer.
2. Read the relevant ones in full (context, decision, consequences, what is not decided), not just the title.
3. Respect them. Do not propose something an accepted ADR rules out without a new ADR that supersedes it. If the code
   and an ADR disagree, tell the human; do not resolve it silently.
4. Cite the ADR by number in the PR description or a spec. Do not scatter ADR numbers through the code.

**Propose an ADR yourself** (ask the human; do not write it unasked) when, while working, you are about to add a new
dependency, introduce a pattern other code will have to follow, choose between real alternatives with non-obvious
trade-offs, contradict an accepted ADR, or find yourself writing a long comment explaining *why*.

## The checker

```bash
node scripts/check-adr.mjs [ADR directory] [--from NNNN]   # run from this skill's directory
```

With no directory it searches the same candidates as above. Covers A-1, B-1, B-3, D-1 (checkboxes), D-2, D-5, E-1, E-2, E-3, E-5, F-2. Exit 1 when any MUST is violated, 2 when no ADR directory is found.
Checks that cannot run on the project's format (for example, no index table) are listed as `Not checked` and are not
reported as violations.
It is a signal, not a verdict: the `J` rules still need reading.

## Out of scope

Pushing, opening PRs, or creating issues. Hand off to the project's PR skill.
