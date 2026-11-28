---
name: udd-arrange
description: "Use when the use cases in a `.kiro/uneri/use-cases.md` are listed in the order they were added and you want them in a meaningful order — arranges the entries by the user's journey (the order an actor meets the goals), grouped under `<!-- journey: … -->` stage markers. Moves entries only: IDs, text and fields are never changed. Proposes the new order, shows every move, and writes only after approval. Triggers include \"arrange use cases\", \"reorder use cases\"."
---

# uneri-skills:udd-arrange — order the use cases by the user's journey

## Overview

`uneri-skills:udd-add` appends, so a long `use-cases.md` ends up in the order the goals were thought of, not the order
a reader needs them. This skill rearranges the entries **by the user's journey**: the order in which an actor
meets the goals — get started, set up, do the daily work, review, administer — grouped under named **stages**.

It **moves entries and nothing else.** IDs are immutable and never reused, so no UC is renamed, renumbered, edited,
merged, split or dropped. The only things it adds are the stage markers. **Local files only**; no `gh`, no MCP.
Output (the proposal and the stage names) is written in the project's language (see Language).

## When to use

- The file has grown past about 15 use cases and the numeric order no longer tells a story.
- A reader (a new member, a product owner) has to scan the whole list to find the goals of one stage.
- **NOT** to add, edit, split or retire a UC (that is `uneri-skills:udd-add` / `uneri-skills:udd-authoring`), and
  **NOT** to renumber. A UC's number says when it was added, never where it sits.

## Language (uneri config)

Language from **`.uneri.json`** (`lang`, set by `/uneri-skills:steering`); no `--lang` argument. Stage names are
localized; the marker key `journey:` and all ids and field keys stay as written.

## The format it produces

Inside the *functional* section, each stage is introduced by one marker comment, and the UCs of that stage follow it:

```markdown
<!-- journey: Get started -->

### UC-XXX-001 …

### UC-XXX-003 …

<!-- journey: Do the daily work -->

### UC-XXX-009 …
```

- The marker is a single-line HTML comment, `<!-- journey: <stage name> -->`. It is not a heading, so the file's
  `##` sections (functional / operational) and the UC headings keep their meaning.
- **Stages run in the order an actor meets them.** Inside a stage, a UC whose result another UC needs comes first
  (for example, one that creates an aggregate before the ones that change it); otherwise the lower ID comes first.
- The *operational* section (`100–`) is arranged the same way by the developer's journey (set up the environment →
  build → ship → run), with its own stage markers.
- A UC belongs to **exactly one** stage. Stages are not nested.

## Steps

1. **Locate the file(s)** the way `uneri-skills:udd-validate` does (`.uneri.json` → `layout`), and load
   `.kiro/uneri/use-cases.md`. If none exists, say so and point to `uneri-skills:udd-init`. Pattern A (multi-context)
   is arranged one file at a time; ask which one when it is not obvious.
2. **Parse the blocks.** A block runs from a `### UC-…` heading to the next heading or marker, and carries its
   fields and any comment inside it. Record the section (functional / operational) and the position of every block.
3. **Attach the comments.** A comment inside a block moves with that block. A comment between two blocks is
   ambiguous — it may explain the UC before it or the UC after it, or be a section marker such as a release tier. Do
   **not** guess: list each one in the proposal with the attachment you propose, and let the user correct it.
4. **Read before sorting.** Read `actor` / `scope` / `realizes` / `aggregates` of each UC, and `domain-model.md` when
   present, to see who meets which goal first and what depends on what. Skip the model if absent.
5. **Propose the stages.** Name 4–8 stages for a functional section (fewer when there are fewer UCs), in journey
   order, and place every UC in one. Prefer the product's own words (from `glossary.md` / the UC names). A stage
   holding a single UC is a sign to merge it into a neighbour.
6. **Show the proposal and wait.** Print, in this order:
   - the stages with their UCs in the new order (id + name);
   - **the moves**: each UC whose position changes, and how far;
   - the comments and what happens to each (kept with a UC / kept at a stage / listed under *to be removed* — an
     old section marker such as a release tier that the stages replace). **Never delete a comment unless the user
     approves that line.**
     The user may rename, merge or split stages, or move any UC. Re-print the changed part and ask again.
7. **Write only after approval.** Rewrite the file once: frontmatter, intro text and the `##` headings stay as they
   are; the blocks are re-emitted in the new order **byte-for-byte**, with the stage markers added. Remove only the
   comments the user approved.
8. **Verify before finishing**, and show the result:
   - the **set of UC ids is identical** before and after (same count, none lost, none duplicated);
   - **every block's text is identical** apart from its position (compare each block with its old text);
   - each UC sits under exactly one stage marker, in the section its band requires (`001–099` functional, `100–`
     operational).
     If any check fails, restore the file from what was read in step 2 and report what broke. Do not leave a half-written file.
9. Tell the user to run **`/uneri-skills:udd-validate`**, and to commit the file on its own so the move is reviewable
   apart from content changes. This skill never runs `git`.

## After arranging

- `uneri-skills:udd-add` puts a new UC at the end of the stage it fits (asking when two fit), not at the end of the file.
- `uneri-skills:udd-validate` stops reporting *Out-of-order* for a file that has stage markers; it reports a UC that
  sits outside every stage instead.
- Re-run this skill when the stages no longer match the product, and expect a few stages to be renamed rather than
  rebuilt. The first arrangement is the large one.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                | ✅ Correct                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Renumbering UCs to match the new order                    | IDs are immutable; only the position changes                                         |
| Editing a UC's name, fields or `notes` while moving it    | Re-emit the block byte-for-byte; edits go through `uneri-skills:udd-add` / by hand   |
| Writing before the user approves the proposal             | Show stages, moves and comment handling first; write once after approval             |
| Guessing where an unattached comment belongs              | List it in the proposal with a proposed attachment and let the user decide           |
| Deleting an old release-tier comment without asking       | Put it under *to be removed* and delete it only on approval                          |
| Turning the stage markers into `###` headings             | Use the single-line `<!-- journey: … -->` comment; headings are for UCs and sections |
| Sorting by actor or by release because it is easier to do | The axis is the user's journey; a release or an actor is not a stage                 |
| Moving a UC across the functional / operational boundary  | The band fixes the section (`001–099` functional, `100–` operational)                |
| Dropping or hiding a `deprecated` UC                      | It stays in its stage, in place, with its marker                                     |
| Running `git` or touching other files                     | Local single-file edit; the user commits                                             |
