---
title: "The use-cases.md contract"
---

How `.kiro/uneri/use-cases.md` declares its machine-readable parts, so that tools and people can read and write it
without guessing. The `uneri-skills:udd-*` skills write the file; any other tool that reads it should follow the rules
here. Normative keywords (MUST, MUST NOT, SHOULD) apply.

Canonical tokens (`UC-`, `EVT-`, `AGG-`, field keys, `context`, `deprecated`) are verbatim in every language;
prose and headings follow the project language (`lang` in `.uneri.json`). The authoring conventions are in the
[`udd-authoring`](./skills/udd-authoring/) skill.

During 0.x the file format is kept compatible. A change to it is announced in the changelog with a migration note.

## 1. File placement: one file = one context

- **Single context:** one file at the repository root, `.kiro/uneri/use-cases.md`.
- **Multiple contexts:** one file per context, at `services/<ctx>/.kiro/uneri/use-cases.md`.
- A file MUST contain exactly one context (mixed contexts in one file are a lint error).
- `.uneri.json` `layout` records the choice (`single-context` or `multi-context`). It MUST NOT list the context codes: each file
  declares its own (section 2), so the list could only drift from the layout.

## 2. Frontmatter

Each `use-cases.md` MUST declare its context code in the YAML frontmatter:

```yaml
---
inclusion: manual
context: SHP # required: the context code for this one file (uppercase)
---
```

- `context` MUST match `^[A-Z0-9]+$`, the same characters as the context part of a UC heading.
- Do not put `lang` here: the language is repository-wide and lives in `.uneri.json`.
- Parsers MUST ignore unknown frontmatter keys.

## 3. How a tool finds a file's context

In this order:

1. The frontmatter `context:`. Authoritative; use it if present.
2. `.kiro/steering/structure.md`, `## Bounded contexts` (`- <CTX> — …`), when the frontmatter is absent. A mismatch with (1) is a
   warning, and the frontmatter wins.
3. The `UC-<CTX>-NNN` headings in the file, only if the context is the same in all of them.
4. The directory name is **not** a source for writing. It may be a last-resort fallback for reading, and the tool MUST warn.
   A directory name ("billing") and a context code ("BIL") are different things.

**Write rule:** a tool MUST NOT number or write a new UC-ID unless the context was resolved by 1 to 3. Otherwise it stops and
asks for a context declaration. Creating the file with its frontmatter is the job of `uneri-skills:udd-init`.

## 4. The shape of a use case

```markdown
### UC-<CTX>-NNN <name: an actor's goal>

- actor: <English identifier(s) from actors.md; several joined by " / "> # required
- realizes: [EVT-<CTX>-NNN, …] # optional (omit for read-model use cases)
- aggregates: [AGG-<CTX>-NNN, …] # optional
- precondition: … # optional
- postcondition: … # optional
- scope: … # optional
- notes: … # optional, a pointer to pending design, not the design itself
- deprecated: <YYYY-MM-DD> <reason> # optional (section 5)
- superseded_by: UC-<CTX>-NNN # optional, only when a new use case replaced it
```

- **Number bands:** `NNN` 001–099 are functional use cases; 100 and up are operational (developer-facing). The next number is the band's
  maximum plus one. Gaps are never back-filled.
- **Order:** the position of a use case in the file is not part of its ID. A list may be arranged by the user's journey, each stage
  introduced by a single-line `<!-- journey: <stage> -->` comment (`uneri-skills:udd-arrange`). A tool MUST NOT read meaning into
  a position.
- There is no size field: a use case is one unit, and the count of use cases is the measure. A `size:` line written by another tool MUST be ignored, not rejected.
- `Status`, `Spec` and `Issue` MUST NOT be written by hand: they are derived from the specs and tasks.
- Scenarios do not belong here. They are written in the spec's `requirements.md`.

## 5. Deprecating or deleting a use case

A use case that anything refers to SHOULD NOT be deleted: its ID is the immutable key that specs, issues and pull requests refer to. Mark it `deprecated:` and leave it in place.

A use case that **nothing refers to** may be deleted. All three must hold:

1. No spec points at it (no `spec.json` has it as `traces_uc`).
2. No GitHub label, issue or pull request carries its ID (the label is created together with the first issue or pull request, so no label means no reference).
3. Its number is **not reused**: it stays a gap, because the ID may still appear in notes, chats and commit messages.

If a use case that something refers to is deleted by mistake, `uneri-skills:sdd-trace` reports the spec as an orphan.

- **Marker:** add `- deprecated: <YYYY-MM-DD> <reason>` to the use case's meta lines, and leave the entry where it is. When a new
  use case replaced it, add `superseded_by: UC-<CTX>-NNN` too.
- The ID and the number stay; the number is never reused. A split or a merge introduces new IDs and deprecates the originals.
- The field MUST NOT be named `status`, which would collide with the derived `Status`.
- A deprecated use case needs no spec. `uneri-skills:udd-validate` and `uneri-skills:sdd-trace` report it as intentionally inactive.
- A numbering gap is not an error: `udd-validate` reports it as information.

## 6. Counting use cases

Progress is counted in use cases:

- An **active** use case has no `deprecated:` line.
- An **implemented** use case is an active one with a spec whose `spec.json` has `phase: "implemented"`.
- **Progress = implemented / active.** A deprecated use case is left out of both numbers, even if its spec was implemented.
  Both number bands are counted together.

`uneri-skills:sdd-trace` reports this count. A tool that shows progress SHOULD use the same rule, so that the numbers agree.

## 7. References between artifacts

- A UC-ID maps to its spec (`spec.json` `traces_uc`), to its GitHub issue, and to the label on its pull requests.
- The ID is therefore immutable. Renaming a use case, or changing its actor, `realizes` or `aggregates`, is fine; changing the ID is not.
- Do not break references to a deprecated use case: its successor is found through `superseded_by`.

## 8. Files without `context:`

A file written before the frontmatter rule has no `context:`. Tools resolve it by section 3 (steps 2 and 3), and
`uneri-skills:udd-validate` reports the missing line. Adding it changes one frontmatter line and nothing else: do not touch the
use cases or their order.
