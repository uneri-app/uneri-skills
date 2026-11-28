---
name: issue-upsert
description: "Use to create-or-update one GitHub Issue with the label that says what it is for: the Issue for one use case (`UC-{CTX}-NNN`, UC label; fills the placeholder's body after `/uneri-skills:sdd-design`, or creates it via `gh` when none exists) or a non-UC Issue (`bug` / `enabler` / `chore`, kind label). Requires `gh` and a GitHub remote. Triggers include \"update the issue for UC-…\", \"create an Issue for this use case\", \"file a bug\", \"file an enabler Issue\". NOT for creating specs (that is uneri-skills:sdd-init)."
---

# uneri-skills:issue-upsert — one GitHub Issue, labelled by what it is for (UC / bug / enabler / chore)

## Overview

Handles two kinds of Issue, told apart **by their labels only**:

| Labels on the Issue           | Kind     | How this skill handles it                            |
| ----------------------------- | -------- | ---------------------------------------------------- |
| a `UC-<CTX>-NNN` label        | use case | **UC Issue** — wins over every other label           |
| `bug`                         | bug      | **Non-UC Issue** (a defect, interrupt work)          |
| `enabler`                     | enabler  | **Non-UC Issue** (planned technical work no UC owns) |
| none of the above (`chore` …) | chore    | **Non-UC Issue** (the fallback; housekeeping)        |

The right label up front keeps the Issue list filterable and the interrupt count honest.

**UC Issue** — reconciles **one GitHub Issue with one UC**: if the Issue already exists it **updates the title/body**; if not it
**creates** it. Either way the Issue carries the **`UC-<CTX>-NNN` label** — the key that ties the Issue to its UC
(a label that parses as a UC-ID makes it a UC Issue; without it the Issue reads as a non-UC `chore`) — and the UC-ID in the **body** (`traces:`) for trace tooling and readers. The Issue is written for **people first**: a PO, manager or teammate
must understand from the Issue alone what this change cycle does, why, and what changes — in plain language, **not** as
a copy of the spec's EARS clauses. It points to the spec (by requirement number) for the exact contract, which is where
an AI coding agent (Copilot, Claude, …) reads the details.
**Non-UC Issue** — a `bug`, an `enabler` (architecture migration, platform/infra work, a large refactor) or a `chore`
(dependency bumps, CI tweaks, typo fixes): **creates** it, or **updates** an existing one given by number, with exactly
one kind label and never a UC label.

**Local files + `gh` only** — no MCP. One invocation = one Issue.
**Side-effect skill, but model-invocable:** it may start from a plain request ("update the Issue for UC-…", "file a bug"),
so the label always lands; safety rests on the **mandatory confirmation gate** (step 7), not on an invocation flag.
Forms:

- `/uneri-skills:issue-upsert <UC-ID>` — the UC's Issue.
- `/uneri-skills:issue-upsert <bug|enabler|chore> "<summary>"` — a new non-UC Issue.
- `/uneri-skills:issue-upsert #<n> [bug|enabler|chore]` — update an existing non-UC Issue (body, or re-kind its label).

## Two roles, split by time — UC Issues (see the project architecture doc)

For a UC's Issue, **creation** and Issue **body enrichment** are deliberately separate responsibilities at different times:

- **① Creation** — spec not needed: the Issue is raised when a UC is groomed into a sprint, by the developer or any
  other tool. Whoever raises it does not know the UC's name (it lives in this repo's `use-cases.md`), so it is a
  **placeholder**: title = bare `UC-<CTX>-NNN`, minimal body with `traces:`, UC label attached. When none exists, the
  developer creates it here via `gh` with a placeholder body.
- **② Body enrichment (steady-state primary)** — the developer's job with **this skill**, run **after the SDD workflow
  (`/uneri-skills:sdd-*`) produces a spec** (typically once `/uneri-skills:sdd-design` is done). The spec material lives in Git,
  invisible to anything outside the repo, so only a repo-side skill can transcribe it into the Issue body — and give it
  its proper title. **By this point the Issue usually already exists → the expected action is `update`, not create.**

So for a UC in steady state this is an **update** command; `create` is the fallback when no
Issue exists yet. Non-UC Issues have no such split — the developer (or this skill) creates them when the work is found.

## When to use

- A UC exists in `.kiro/uneri/use-cases.md` and you want its GitHub Issue reconciled — **update** its body after a
  spec is available (recommended after `/uneri-skills:sdd-design`), or **create** it if none exists yet.
- A defect was found → `bug`. Planned technical work no UC owns → `enabler` (a large refactor is an `enabler`, not a
  `chore` — it is planned work, not housekeeping). Small housekeeping → `chore`. Create it, or fix an existing
  Issue's kind label/body by number.
- **NOT** for creating a spec from a UC (that is `uneri-skills:sdd-init`) and **NOT** for writing anywhere but GitHub.

## Language (uneri config)

Language from **`.uneri.json`** (`lang`, set by `/uneri-skills:steering`); no `--lang` argument. The UC heading text comes
from use-cases.md, so the Issue naturally matches. Field names (`actor:`, `traces:`) stay as-is in any language.

## The contract (forward compatibility — do not break)

### UC Issue

1. **The `UC-<CTX>-NNN` label is attached.** The label says this is a UC Issue and which UC it belongs to, **from labels only** (the same label `uneri-skills:pr-upsert` puts on PRs). Title or body alone is NOT enough.
2. **UC-ID appears in the body as plain text** (heading + `traces:` line). Inside a URL only is NOT enough.
3. **`traces: UC-<CTX>-NNN` marker** on its own line in the Issue body — a grep-able key that trace tooling uses to
   cross-reference UC ↔ Issue. (Specs track their originating UC via the `traces_uc` field in `spec.json`.)
4. **The body is human-readable and points to the spec for the exact contract.** Plain language, covering only what this
   change cycle changes; each described behaviour is tagged with the spec's requirement number (e.g. `(10.8)`) so a
   reader or an AI agent can jump to the exact wording. References use **repo-root paths** (an AI coding agent
   works in a checkout of this repo, so paths beat URLs); adding full URLs for human readers is optional
   (directories use `/tree/<branch>/…`, files `/blob/<branch>/…` — Issue bodies do not resolve relative links).
5. **The implementation record is a marked block** (`<!-- uneri-skills:implementation-record:start/end -->`) holding the
   cycle's PRs (Development ∪ UC-labelled PRs); only that block is regenerated on update.
6. **No kind labels** (`bug` / `enabler` / `chore`) on a UC Issue — the UC label wins, so they are ignored and only
   blur the Issue's meaning.

### Non-UC Issue

1. **Exactly one kind label** — `bug`, `enabler` or `chore` (lowercase).
   `bug` wins over `enabler` if both are present — never attach two.
2. **Never a `UC-<CTX>-NNN` label.** A UC label overrides the kind and makes the Issue that UC's own Issue. If the work concerns a UC's feature (e.g. a bug in UC-CTX-008), write `related: UC-CTX-008` in the
   body — plain text, **not** a `traces:` line (`traces:` marks the UC's own Issue and is 1:1 with it).
3. **The body is readable on its own** by a person, with repo-root paths for an AI coding agent, like a UC Issue.

## Steps

Step 1 is shared. Steps 2–6 are the **UC path**; for a non-UC Issue follow **Non-UC path** (N2–N5) instead. Steps 7–8
are shared.

1. **Preconditions (fail-soft).** A GitHub remote must exist; `gh` must be authenticated (a successful `gh` read
   in this session counts as proof — no need for a separate `gh auth status`). If missing, say what is needed and
   stop. Change nothing.
2. **Read the UC** `UC-<CTX>-NNN` from `.kiro/uneri/use-cases.md`: heading, `actor`, and the raw
   `realizes` / `aggregates` **ID lists only**. Not found → stop.
3. **Find the spec (optional).** If `.kiro/specs/<NNN>-*/` exists, use it to enrich the body (below) and include its
   URL. If not, continue without it — do not require a spec.
4. **Resolve create vs update.** `gh issue list --search "UC-<CTX>-NNN" --state all` (also matches a
   placeholder, whose title and body carry the bare UC-ID; check for an **exact** UC-ID match — `UC-CTX-001` is a
   substring of `UC-CTX-0010`).
   - Fetch the candidates with `gh issue list --search "UC-<CTX>-NNN" --state all --json number,title,state,labels,createdAt,closedAt`
     and keep the exact UC-ID matches. A UC has **one Issue per change cycle**: the Issue is closed when the
     cycle is accepted or rejected, and a later PR/Issue for the same UC starts a new cycle with a new Issue.
     An explicit `/uneri-skills:issue-upsert <UC-ID> #<n>` targets that Issue (open or closed) and skips this selection.
   - **An open Issue exists → UPDATE it** (the steady-state path): recompose the title/body (step 6) and prepare
     `gh issue edit <n> --title … --body …`, plus `--add-label "UC-<CTX>-NNN"` if the Issue lacks the label
     and `--remove-label` for any kind label (`bug` / `enabler` / `chore`) it carries (contract 6).
     Report the existing number/URL. Do not open a second *open* Issue for the UC.
   - **Only closed Issues exist** → the skill cannot see whether the latest cycle is finished or merely closed by the developer
     awaiting acceptance. **Ask once**: *update
     the latest closed Issue #n* (e.g. writing up a finished sprint — the common case) or *open a new change cycle's
     Issue*. Never open a new one silently.
   - **No exact match → CREATE** (no Issue yet): prepare `gh issue create … --label "UC-<CTX>-NNN"`.
   - **Resolve the label first** (both paths), exactly as `uneri-skills:pr-upsert` does: `gh label list --search
     "UC-<CTX>-NNN" --json name`, check for an **exact** name match; if none, prepare
     `gh label create "UC-<CTX>-NNN" --color 1f6feb --description "Use case UC-<CTX>-NNN"` before the create/edit.
     Reuse an existing label as-is (never edit its color/description here).
5. **Collect the implementation record** (update path, or a new Issue when the user names PRs): the PRs that did the
   work of **this change cycle**, so the body can say what was actually built — not only what was planned.
   Union two sources by PR number (Development alone is not enough: GitHub allows **at most 10 manually linked PRs per
   Issue**, so a busy cycle's extra PRs never appear there):
   1. **Development** — `gh issue view <n> --json closedByPullRequestsReferences` (uneri links merged PRs here after the
      merge; it never closes the Issue).
   2. **UC label** — `gh pr list --label "UC-<CTX>-NNN" --state all --limit 100 --json number,title,state,body,createdAt,mergedAt,url`.
      The label is the same for every cycle, so keep only PRs of this cycle: created from the **later of** (a) **one day
      before** the Issue's `createdAt` (a PR that opened first creates the Issue a moment later) and (b) the `closedAt`
      of the UC's **previous** Issue (the latest exact-UC-ID Issue from step 4 that closed before this one was created —
      its cycle ended there, so PRs merged in between belong to it, not to this cycle), until this Issue's `closedAt`
      when it is closed. Without (b), a new Issue raised the day after the previous cycle's acceptance would pull in
      that cycle's late PRs. PRs in Development are always kept (explicitly linked).
      Show the resulting PR list in the confirmation gate (step 7) so the user can drop PRs that belong to another cycle.
      For each PR record the number, title, state (merged / open / closed), merge date and a **one-line summary** taken
      from the PR body (its summary section or first paragraph). Do not fetch diffs unless the body is empty and the user
      asks. No PRs found → omit the section's table and say so in one line.
6. **Compose title and body.**
   - **Title**: `UC-<CTX>-NNN: <what this change cycle did>` — one short phrase, in the `.uneri.json` language, that
     says what was built or changed (e.g. `UC-CTX-008: Reflect an Issue title change onto its card`). **Not the UC
     heading**: the UC name is already reachable from the UC-ID (and the body heading below carries it), while one UC
     has one Issue per change cycle, so a title that repeats the UC name makes every cycle look the same in the Issue
     list. This phrase is also what the Issue list and a project board show.
     Derive the phrase from the cycle's scope: the spec's latest change/addendum heading in `requirements.md`, and the
     implementation record's PR titles (step 5); for a first cycle, the goal in one phrase. Propose it in the
     confirmation gate (step 7) for the user to edit. On update, rewrite the title whenever it differs — e.g. the
     a placeholder (bare `UC-<CTX>-NNN`) — but keep a title the user already worded unless the cycle's
     scope changed.
   - **Body** (human-readable). The example below is in English; the section headings render in the
     `.uneri.json` language — e.g. for a `ja` project: `### この変更サイクルでやること`, `### 参照（正はリポジトリ側）`.
     The keys (`actor`/…), IDs, and the `traces:` trailer stay identical across languages.

     ```markdown
     ## UC-CTX-008: Track an order

     - actor: PM
     - realizes: EVT-CTX-012
     - aggregates: AGG-CTX-005

     ### What this change cycle does

     (Plain language. Why, then what changes — a short list, each item tagged with the spec's requirement number.)

     - When a PM opens a project, the list shows its archived projects too, in a separate group. (3.2)
     - Archived projects are read-only; editing one shows why. (3.4)

     Out of scope: restoring an archived project.

     <!-- uneri-skills:implementation-record:start -->

     ### Implementation record (this change cycle)

     | PR  | State  | Merged     | Summary                     |
     | --- | ------ | ---------- | --------------------------- |
     | #42 | merged | 2026-03-05 | (one line from the PR body) |
     | #47 | open   | —          | (one line from the PR body) |

     <!-- uneri-skills:implementation-record:end -->

     ### References (repository is source of truth)

     - spec: `.kiro/specs/008-order-tracking/` (**the spec wins — if the Issue drifts from it, the spec is authoritative**)
     - use-cases: `.kiro/uneri/use-cases.md`

     ---

     traces: UC-CTX-008
     ```

   - `realizes`/`aggregates` are **bare comma-separated IDs** (strip the `[…]` brackets used in use-cases.md);
     omit the lines if the UC has none. Omit the `spec` reference line if no spec exists yet.
   - **Implementation record** (step 5): only the block between the two `uneri-skills:implementation-record` marker comments is
     regenerated from the PRs on every update; text outside it is kept as is. Insert the block before the References
     section when it is absent (a `ja` project: `### 実装の記録（この変更サイクル）`, columns PR／状態／マージ日／概要).
     Leave it out entirely when step 5 found no PRs. The Issue is where the sprint review reads "what we built in
     this cycle", so list **every** PR of the cycle, not only the ones in Development.
   - **"What this change cycle does" = the pass criterion is "a person understands the cycle from the Issue alone"**:
     - **Only what changed in this cycle** — not the whole `requirements.md`. Find it from the cycle's PRs (step 5) and the
       spec's dated additions/revisions; list the requirements they added or revised. A UC's first cycle covers the UC's
       goal and its main behaviours.
     - **Plain language, short.** One sentence of why, then a short list of behaviours ("when …, …"), each tagged with the
       spec requirement number — e.g. `(10.8)`. Do **not** paste the EARS clauses (the `When … the system shall …`
       wording) or the spec's internal jargon; the spec holds the exact wording and the tag leads to it. Add the main
       out-of-scope line, and one line on a design decision only if a reader needs it. Do not transcribe `tasks.md`.
     - No spec yet (create) → the UC entry plus the relevant `domain-model.md` definitions
       (aggregate/commands/events for this UC's `aggregates`/`realizes`) and any `glossary.md` terms it depends on,
       in plain language.
     - The summary duplicates the spec, which is accepted **because** the source-of-truth note is present: the
       References section must declare that the spec (or the `.kiro/uneri/` docs) wins if the Issue drifts.

### Non-UC path (bug / enabler / chore)

- **N2. Resolve the kind.** From the argument; if absent or ambiguous, ask once (bug / enabler / chore) with the rule
  from *When to use*. Do not guess `chore` for a large refactor or migration — it is `enabler`. If the work is building
  or changing a UC's behavior (not a defect in it), stop and use the UC path instead.
- **N3. Resolve create vs update.**
  - **`#<n>` given → UPDATE** that Issue. Read it (`gh issue view <n> --json title,body,labels`); if it carries a UC
    label, stop — it is a UC Issue (UC path). Prepare `gh issue edit <n>` with the recomposed body (N5) and
    `--add-label "<kind>"`, plus `--remove-label` for any other kind label it has (re-kinding, e.g. `chore` →
    `enabler`).
  - **No number → CREATE**, after a duplicate check:
    `gh issue list --search "<key words from the summary>" --state open --json number,title,labels`. If a plausible
    duplicate exists, show it and ask whether to update that one instead. Never silently open a second Issue for the
    same work.
- **N4. Resolve the kind label** the same way as the UC label (step 4): `gh label list --search "<kind>" --json name`,
  exact (case-insensitive) match; if none, prepare `gh label create "<kind>" --color <color> --description "<…>"`
  before the create/edit — colors `bug` `d73a4a`, `enabler` `0e8a16`, `chore` `cfd3d7`. Reuse an existing label as-is.
- **N5. Compose title and body.**
  - **Title**: a plain, specific summary — no `UC-` prefix and no kind prefix (the label carries the kind). On update,
    keep the existing title unless the user asks to change it.
  - **Body** by kind (headings in the `.uneri.json` language; English shown). Fill each section from what the user
    gave and what the repo shows; ask only for what is missing and essential (for a `bug`, an observed symptom or
    reproduction steps). On update, keep what others wrote and only fill or correct sections.

    ```markdown
    <!-- bug -->

    ### Symptom

    ### Steps to reproduce

    ### Expected / actual

    ### Environment

    related: UC-CTX-008 (only if it concerns a UC's feature)
    ```

    ```markdown
    <!-- enabler -->

    ### Goal (why this technical work, what it unblocks)

    ### Scope / out of scope

    ### Done when

    related: UC-CTX-012, UC-CTX-015 (UCs it unblocks, if any)
    ```

    ```markdown
    <!-- chore -->

    ### What

    ### Done when
    ```

### Shared

7. **Confirm before writing (mandatory gate).** Show the exact `gh label create` (if needed) and `gh issue create` / `gh issue edit` command with full
   title/body and get the user's go-ahead. This gate is not skippable — not for time pressure, not because "the user
   asked for it so consent is implied".
8. **Apply.** Run the confirmed commands in order — `gh label create` (if needed), then `gh issue create …` (create)
   or `gh issue edit <n> …` (update) — and report the resulting URL. On
   failure (auth, network, permissions), hand the user the composed command to run manually — do not lose the work.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                    | ✅ Correct                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opening a second *open* Issue for the UC                      | Search `--state all` first (step 4); an open Issue ⇒ **update** it. Only closed ones ⇒ ask once (update the latest, or a new change cycle) — never open a new one silently                                                       |
| Reading only Development for the implementation record        | Development holds at most 10 manually linked PRs; union it with the UC-labelled PRs of the cycle (step 5)                                                                                                                        |
| Mixing PRs of earlier change cycles into the record           | The UC label is shared by every cycle — filter by the Issue's window (from the later of `createdAt` − 1 day and the previous Issue's `closedAt`, until its own `closedAt`) and let the user drop strays in the confirmation gate |
| Rewriting hand-written text around the implementation record  | Regenerate only the block between the `uneri-skills:implementation-record` markers                                                                                                                                               |
| Treating this as create-only                                  | Steady state is **update after `/uneri-skills:sdd-design`**; create is the fallback when no Issue exists yet                                                                                                                     |
| Creating/updating the Issue without the `UC-<CTX>-NNN` label  | Always attach it (create the label first if missing — step 4). Labels are the only key; an unlabeled UC Issue reads as a stray `chore`                                                                                           |
| Leaving a placeholder title (bare UC-ID)                      | On update, rewrite the title to `UC-<CTX>-NNN: <what this cycle did>` (not the UC heading) — step 6                                                                                                                              |
| Pasting the spec's EARS clauses, or the whole requirements.md | Summarise only what changed this cycle, in plain language, each point tagged with its requirement number — step 6                                                                                                                |
| Summarising the spec without declaring the source of truth    | References section must say the spec/`.kiro` docs win if the Issue drifts                                                                                                                                                        |
| Embedding a workflow checklist with this repo's command names | The Issue tracks the goal + contract, not process; command names are repo-specific                                                                                                                                               |
| Transcribing `tasks.md` into the body                         | Do not — the implementing agent plans its own work; the body carries the goal + what changes                                                                                                                                     |
| UC-ID only in the title                                       | Label (the UC key) + body heading and `traces:` line (trace key) — step 6 / contract                                                                                                                                             |
| Omitting the `traces:` marker                                 | Required grep key for trace tooling                                                                                                                                                                                              |
| Attaching a `UC-<CTX>-NNN` label to a bug about a UC          | No UC label on a non-UC Issue — it would make the Issue that UC's own. Write `related: UC-…` in the body                                                                                                                         |
| Writing `traces: UC-…` in a non-UC Issue                      | `traces:` belongs to the UC's own Issue only (1:1, trace key); use `related:`                                                                                                                                                    |
| Adding `bug` / `enabler` / `chore` labels to a UC Issue       | The UC label wins — kind labels are ignored there. UC Issues carry the UC label only                                                                                                                                             |
| A non-UC Issue with no kind label, or two                     | Exactly one of `bug` / `enabler` / `chore`; when re-kinding, remove the old one (N3)                                                                                                                                             |
| Filing a large refactor or migration as `chore`               | It is an `enabler` — planned work that should be counted, not housekeeping                                                                                                                                                       |
| Writing without showing the command and getting confirmation  | External write ⇒ mandatory user gate (step 7)                                                                                                                                                                                    |
| Writing the Issue number back into use-cases.md               | Status/Spec/Issue are never written there — they are derived from specs and tasks                                                                                                                                                |
| Setting milestone / syncing human assignees                   | Not this skill's job. Assigning an **AI coding agent** at the user's explicit request is fine (a trigger, not sync) — do it after the write, e.g. `gh issue edit <n> --add-assignee …`                                           |
| Writing anywhere but GitHub (API/MCP)                         | Never — this skill's only write path is `gh`                                                                                                                                                                                     |
