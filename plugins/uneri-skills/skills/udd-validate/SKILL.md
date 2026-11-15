---
name: udd-validate
description: Use when checking a `.kiro/uneri/use-cases.md` for integrity — a read-only, Markdown-only validation (lint-style, no deps) reporting UC-ID duplicates, band/section violations, a missing `actor`, unregistered actors, dangling `realizes`/`aggregates`, multiple `{CTX}`, gaps, use cases outside every journey stage, stray generated fields, localized field keys, and `notes` fields that have grown into design content. Triggers include "validate use cases", "lint use cases", "use-cases.md をチェック", "UCの整合を確認", or after uneri-skills:udd-add. Reports only (does not edit). A later version may delegate to a dedicated trace tool. Output language follows `.uneri.json`.
---

# uneri-skills:udd-validate — validate `use-cases.md` (single file)

## Overview

A **read-only** integrity check of one `use-cases.md`. It parses the Markdown itself (no Node / no external
tools), reports problems by severity, and **does not modify the file** — fix via `uneri-skills:udd-add` or by hand. Pairs with
`uneri-skills:udd-add` for a fast add → lint authoring loop. **Report is written in the project's language** (see Language).

> **Layering:** v0.x = this skill parses `use-cases.md` directly. **v1.0+** = this skill may become a thin entry
> to a dedicated trace tool so cross-repo traceability/gap/dangling checks are unified in the tool; the skill then just
> runs it and explains results.

## When to use

- After `uneri-skills:udd-add`, or anytime, to verify `.kiro/uneri/use-cases.md` is well-formed and consistent.
- **NOT** to fix issues (report only) and **NOT** for cross-spec/tasks traceability (a later, dedicated trace tool).

## Language (uneri config)

Emit the report in the language from **`.uneri.json`** (`lang`, set by `/uneri-skills:udd-init`); uneri-skills:udd-validate **reads** it and takes no `--lang`
(`.uneri.json` → specs' `spec.json` → `en`). Localize prose; keep ids and field keys (`UC-`/`EVT-`/`AGG-`, `actor`) verbatim.

## Steps

1. **Locate the file(s).** Resolve the layout from `.uneri.json` → `layout` (`single-context` ⇒ Pattern B,
   `multi-context` ⇒ Pattern A); if absent, detect it (`services/<ctx>/` tree ⇒ A, single root `.kiro/` ⇒ B), and on
   mismatch with the actual layout, warn and confirm. Then load `.kiro/uneri/use-cases.md` (Pattern B) or each
   `services/<ctx>/.kiro/uneri/use-cases.md` (Pattern A). If none exists, say so and point to `uneri-skills:udd-init`.
2. **Parse** the frontmatter `context:` value, then every `### UC-<CTX>-NNN <name>` heading and its
   `actor`/`realizes`/`aggregates`/`precondition`/`postcondition`/`scope`/`notes` fields, and note which
   section (functional / operational) each sits under.
3. **Run the checks** (below), collecting findings with UC-ID + line number.
4. **Optionally load siblings for cross-file checks** (same dir, still Markdown-only): `actors.md` (actor registry),
   `domain-model.md` (`EVT-`/`AGG-` ids). Skip a cross-file check if its file is absent (note it as skipped).
5. **Report** grouped by severity with a summary count. Suggest the fix for each (e.g. "register actor in `actors.md`",
   "renumber via `uneri-skills:udd-add`"). Do **not** edit the file.

## Checks

**ERROR** (must fix):

- **Malformed ID** — heading is not exactly `UC-<CTX>-NNN` with `NNN` = 3-digit zero-padded.
- **Duplicate ID** — the same `UC-<CTX>-NNN` appears twice.
- **Missing `context:` frontmatter** — the file has no `context: <CTX>` key in its frontmatter (required for self-identification).
- **`context:` ↔ heading CTX mismatch** — the frontmatter `context:` value differs from the `<CTX>` used in the UC-ID headings.
- **Multiple `<CTX>`** — more than one context code in a single file (one `<CTX>` per file; must equal the frontmatter `context:`).
- **Band ↔ section mismatch** — `001–099` must be under *functional*, `100–` under *operational*.
- **Missing required field** — `actor` absent. A `size:` line (some tools write one) is ignored.
- **Stray generated field** — inline `Status:` / `Spec:` / `Issue:` (these are derived from specs and tasks).
- **Unregistered actor** *(if `actors.md` present)* — an `actor` token (split on `/`) not in the `actors.md` catalog
  (English identifier).
- **Localized field key** — a translated key in place of a canonical one (e.g. `事前条件:`/`対象:`/`備考:` instead of
  `precondition:`/`scope:`/`notes:`). Field keys stay canonical English regardless of the project's output language
  (see `uneri-skills:udd-authoring`); only the value text is localized.

**WARNING**:

- **Dangling upstream ref** *(if `domain-model.md` present)* — a `realizes: [EVT-…]` / `aggregates: [AGG-…]` id not
  defined in `domain-model.md`.
- **Dangling `superseded_by`** — a `superseded_by: UC-<CTX>-NNN` whose target id does not exist in this file.
- **`notes` reads like design content** — the field is long (heuristically, more than ~2 lines / ~200 chars) or
  mentions concrete design artifacts (API paths, DB table/column names, worked-out decisions). This belongs in the
  UC's spec `design.md` (`/uneri-skills:sdd-design`), not in steering — flag it, don't rewrite it.

**INFO**:

- **Numbering gap** — a missing number within a band. May be a legitimately **retired** UC (ids are immutable / not
  back-filled); flag so the author confirms it is intentional, not an accidental skip. Prefer marking a dropped UC
  `deprecated` in place over deleting it into a gap (see `uneri-skills:udd-authoring`).
- **Deprecated UC** — a UC carrying a `deprecated:` marker; list it so the author knows it is intentionally inactive
  (it needs no spec — `uneri-skills:sdd-trace` treats it as intentionally un-specced). Note its `superseded_by` successor if present.
- **Out-of-order** — ids not ascending within a band (cosmetic). **Skip this check when the file has
  `<!-- journey: … -->` stage markers** (see `uneri-skills:udd-arrange`): the order is then the user's journey, not the ID.
- **Outside every stage** *(only when stage markers exist)* — a UC that sits before the first marker of its section, so
  it belongs to no journey stage. Suggest placing it with `uneri-skills:udd-arrange`.

## Report format

```
uneri-skills:udd-validate: .kiro/uneri/use-cases.md  —  E:<n> W:<n> I:<n>
ERROR   frontmatter  context: missing (add `context: <CTX>`)
ERROR   frontmatter  context: BIL ≠ heading CTX SHP (must match)
ERROR   UC-SHP-014  actor missing (required)
ERROR   UC-SHP-021  actor "Robot" not registered in actors.md
ERROR   UC-SHP-046  localized field key "事前条件:" (use canonical "precondition:")
WARNING UC-SHP-030  aggregates references AGG-SHP-099 not in domain-model.md
WARNING UC-SHP-050  notes reads like design content (mentions API path / DB column) → move to spec design.md
INFO    UC-SHP-057 outside every journey stage (place it with udd-arrange)
INFO    gap: UC-SHP-008 absent (retired? otherwise the next add should not skip)
INFO    UC-SHP-060 deprecated 2026-03-14 (superseded_by UC-SHP-073; needs no spec)
(cross-file: actors.md ✓ / domain-model.md ✓)
```

Report **"no issues"** explicitly when clean. Localize the labels; keep ids/keys verbatim.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                            | ✅ Correct                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| Editing / auto-fixing the file                        | Report only; fixes go through `uneri-skills:udd-add` or manual edit       |
| Treating a numbering gap as an error                  | Gap = **INFO** (retired UCs keep their number; no back-filling)           |
| Flagging a `deprecated` UC as an error / missing spec | Valid & intentional; report as **INFO** (needs no spec)                   |
| Failing when `actors.md`/`domain-model.md` are absent | Skip that cross-file check and note it; core single-file checks still run |
| Re-implementing repo-wide traceability                | Out of scope here (a later, dedicated trace tool); this is single-file    |
| Reporting in the wrong language                       | Follow `.uneri.json` `lang` (see Language)                                |

## Note on invocation

Invoked as `/uneri-skills:udd-validate` — the `uneri-skills:` namespace is supplied by the plugin. Language comes from `.uneri.json` (set by `/uneri-skills:udd-init`); this skill takes no `--lang`.
