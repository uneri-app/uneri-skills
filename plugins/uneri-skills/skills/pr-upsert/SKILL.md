---
name: pr-upsert
description: "Use to create-or-update the GitHub Pull Request for the current branch, always with a label saying what it is for: the `UC-{CTX}-NNN` label for a use case's spec (`{feature-name}`), or `bug` / `enabler` / `chore` for a PR no UC owns. Requires `gh` and a GitHub remote; every write waits for the user's confirmation. Triggers include \"open a PR for this feature\", \"update the PR\", \"PR upsert\". NOT for merging, requesting review, or linking Issues (that is `uneri-skills:issue-upsert`)."
argument-hint: <feature-name> | <bug|enabler|chore> ["<summary>"]
---

# uneri-skills:pr-upsert — one GitHub PR, labelled by what it is for (UC / bug / enabler / chore)

## Overview

Reconciles **one feature branch with one GitHub Pull Request**, sourced from its spec: if a PR
already exists for the current branch it **updates** title/body/label/draft-state; if not it
**creates** one (pushing the branch first if needed). For a UC's PR, whether it is a **draft** or
**ready for review** is derived automatically from `spec.json.phase` — no manual draft/ready toggling.
**Local files + `git push` + `gh` only** — no MCP, no merging, no review requests.
**Side-effect skill, but model-invocable:** it may start from a plain "open a PR" request, and that is
the point — a PR opened through this skill always carries its label, where a bare `gh pr create`
would not. Safety does not rest on an invocation flag but on the **mandatory confirmation gate**
(step 7): nothing is pushed or written to GitHub before the user approves the exact commands.

Two kinds of PR, told apart by the first argument — told apart **by
their labels only**:

| First argument              | Labels on the PR        | Path                                                |
| --------------------------- | ----------------------- | --------------------------------------------------- |
| a feature name (`NNN-slug`) | `UC-<CTX>-NNN`          | **UC path** — sourced from the spec                 |
| `bug` / `enabler` / `chore` | exactly that kind label | **Non-UC path** — a PR no UC owns; never a UC label |

This is the PR-facing counterpart to `uneri-skills:issue-upsert` (which reconciles an Issue, with the same
UC / `bug` / `enabler` / `chore` labels). The two are independent: `pr-upsert` never touches Issues
and does not require one to exist. Both attach the same labels (auto-created if missing): they are
the key that ties a PR or Issue to a UC or to a non-UC kind, and the
UC label doubles as a UC filter in the GitHub UI. A PR with neither a UC nor a kind label cannot be
told apart from any other, and a person has to sort it by hand.

## When to use

- A spec's tasks are partially or fully implemented on a feature branch, and you want a PR opened
  or refreshed (title, body, label, draft/ready state) to match the current spec/task state.
- Anytime during implementation — running it early opens a draft PR for early CI/review visibility;
  running it again after `/uneri-skills:sdd-validate-impl` reports GO flips it to ready for review.
- **Non-UC path:** a branch whose work no UC owns — a defect fix (`bug`), planned technical work such
  as a migration or a large refactor (`enabler`), or small housekeeping (`chore`). A large refactor
  is an `enabler`, not a `chore` — it is planned work, not housekeeping. If the branch builds or
  changes a UC's behavior (not a defect in it), use the UC path instead.
- **NOT** for merging, requesting human review, or linking a GitHub Issue — that is `uneri-skills:issue-upsert`
  and the repository's normal PR review flow (`/code-review`).

## Language (uneri config)

Language from **`.uneri.json`** (`lang`, set by `/uneri-skills:steering`); no `--lang` argument. Localize
prose in the PR body; keep IDs, field keys (`traces_uc`, `phase`), and requirement numbers verbatim.

## Preconditions (fail-soft)

1. **`gh` must be authenticated and a GitHub remote must exist.** A successful `gh` read earlier in
   this session counts as proof — no need for a separate `gh auth status`. If missing, say what is
   needed and stop. Change nothing.
2. **The current branch must not be `main`.** If it is, stop and tell the user to switch to (or
   create) a `feat/<topic>` / `fix/<topic>` branch first — this repository's GitHub Flow never
   pushes to `main` directly.
3. **UC path only: `.kiro/specs/<feature-name>/spec.json` must exist.** Not found → stop and suggest
   `/uneri-skills:sdd-init` first. (The non-UC path needs no spec.)

## Steps

### Route first

Decide the path before anything else — from the first argument:

- a feature name (`NNN-slug`) → **UC path**; `bug` / `enabler` / `chore` → **Non-UC path**.
- **No argument at all** (e.g. started from a plain "open a PR"): if exactly one spec under `.kiro/specs/`
  matches the branch (its directory name is in the branch name, or it is the only spec with `phase` below
  `implemented`), take the UC path with that feature; otherwise ask once — a feature name, or
  `bug` / `enabler` / `chore`. Never guess between a UC label and a kind label: a wrong one files the PR
  under the wrong use case.

### UC path (`<feature-name>`)

1. **Preconditions.** Run the checks above in order; stop on the first failure.

2. **Read the spec.** Load `.kiro/specs/<feature-name>/spec.json` for `traces_uc` and `phase`. Load
   `tasks.md` and collect completed (`[x]`) tasks and their `_Requirements:` metadata (same flexible
   matching as `uneri-skills:sdd-trace` — emphasis may be `*` or `_`, label may or may not be emphasized).
   If `requirements.md` exists, load it and collect its full set of numbered requirements (`1.1`,
   `1.2`, …) — needed in step 6 to detect requirements no completed task covers. If it does not
   exist yet, skip the uncovered-requirements check in step 6. If `verification.md` exists (written
   by `/uneri-skills:sdd-validate-impl`), read it for the test-plan section (below).

3. **Determine draft vs ready.**
   - `spec.json.phase` below `implemented` → the PR should be a **draft**.
   - `spec.json.phase == implemented` (a GO from `/uneri-skills:sdd-validate-impl`) → the PR should be
     **ready for review**.
   - `spec.json.phase` only moves forward once `implemented` is reached, so a ready→draft
     transition is out of scope and not attempted.

4. **Resolve create vs update.** `gh pr list --head <current-branch> --state all --json number,state,isDraft,title,url,labels`.
   - **Hit, `state == OPEN`** → **UPDATE**: recompose title/body/label (step 6) and prepare
     `gh pr edit <n> …`; if the draft/ready state (step 3) differs from the PR's current `isDraft`,
     also prepare `gh pr ready <n>` (draft → ready) — `spec.json.phase` only moves forward once
     `implemented` is reached, so the reverse (ready → draft) is out of scope and never attempted.
     If the branch is ahead of its remote (unpushed local commits), **prepare** a `git push` so the PR
     reflects current state — it is run in step 8, after the gate, never here.
   - **Hit, `state != OPEN`** (closed or merged) → **STOP**. Report the existing PR's number/URL and
     tell the user this branch already has a closed/merged PR; do not reopen it and do not create a
     second one. Suggest a fresh branch if new work is needed.
   - **No hit** → **CREATE**: prepare `git push -u origin <current-branch>` if the branch has no upstream
     yet, or a plain `git push` if it does but is ahead of its remote (run in step 8, after the gate),
     then prepare `gh pr create …`
     with `--draft` when step 3 says draft **and with `--label` for every UC label from step 5** — the
     label goes on at creation, never in a follow-up `gh pr edit --add-label` (see step 5).

5. **Resolve the label.** Label name is `UC-<CTX>-NNN` (from `spec.json.traces_uc`, verbatim). If
   `traces_uc` holds more than one UC-ID, resolve and attach **every one** (one `--label` each).
   **Create path: the label is passed to `gh pr create --label` itself**, so the PR is never opened
   unlabeled — a PR without a UC/kind label has to be sorted by hand, and a project guard may
   reject a `gh pr create` that carries no `--label`. **Update path:** `gh pr edit <n> --add-label`.
   For each label, run `gh label list --search "UC-<CTX>-NNN" --json name` and check for an **exact** name match in the
   results — `--search` is a substring match, so e.g. searching `UC-CTX-001` also returns
   `UC-CTX-0010`; treating any hit as presence risks skipping creation and then failing on
   `--add-label` against a label that doesn't actually exist. If no exact match, prepare
   `gh label create "UC-<CTX>-NNN" --color 1f6feb --description "Use case UC-<CTX>-NNN"` before the
   `--label` / `--add-label` step. If an exact match exists, reuse it as-is (never edit an existing label's
   color/description here).

6. **Compose title and body.**
   - **Title**: follow the **project's own PR title convention** — read it from the project's
     contributor docs (e.g. `CLAUDE.md`) or, failing that, from the titles of recent merged PRs
     (`gh pr list --state merged --limit 5 --json title`). Do **not** prefix the UC-ID: the
     `UC-<CTX>-NNN` label (step 5) is the key that ties the PR to the UC, and the Traceability section
     below repeats it, so the title carries no identifier. If no convention is discernible, use a
     one-line summary — the UC heading text from `.kiro/uneri/use-cases.md` if available, otherwise
     a summary of the completed tasks. On update, only change the title if the underlying summary
     source changed.
   - **Body**:

     ```markdown
     ## Summary

     - <1-3 bullets summarizing the completed [x] tasks in tasks.md>

     ## Traceability

     - UC: UC-<CTX>-NNN (.kiro/uneri/use-cases.md)
     - Spec: .kiro/specs/<feature-name>/
     - Requirements: <comma-separated requirement numbers collected from completed tasks'
       `_Requirements:` metadata — e.g. "1.1, 1.2, 2.1">

     ## Test plan

     - [ ] <one item per verification command, sourced from verification.md if it exists,
           otherwise reconstructed from tasks.md's completed-task validation commands>
     - [ ] AI review: /code-review

     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```

     Section headings render in the `.uneri.json` language; IDs, field keys, and requirement
     numbers stay verbatim. If no requirement numbers were found, write "not yet tracked" instead
     of an empty list. If `requirements.md` has requirement numbers that no completed task's
     `_Requirements:` metadata covers, list those separately as uncovered in the Traceability
     section rather than silently omitting them. If `verification.md` does not exist, note in the
     Test plan that `/uneri-skills:sdd-validate-impl` has not run yet, then list the completed tasks' own
     validation commands as the checklist.

### Non-UC path (`bug` / `enabler` / `chore`)

- **N0. Preconditions 1 and 2** (`gh` authenticated with a GitHub remote; not on `main`) — the same
  checks as step 1; stop on the first failure. Precondition 3 (the spec) does not apply here.
- **N1. Resolve the kind.** From the first argument; if absent or ambiguous, ask once (bug / enabler /
  chore) with the rule from *When to use*. Do not guess `chore` for a large refactor or migration —
  it is `enabler`. If a spec under `.kiro/specs/` traces a UC the branch is implementing, stop and use
  the UC path instead.
- **N2. Resolve create vs update.** `gh pr list --head <current-branch> --state all --json number,state,isDraft,title,url,labels`.
  - **Hit, `state == OPEN`** → **UPDATE**: recompose the body (N4) and prepare `gh pr edit <n> …` with
    `--add-label "<kind>"`, plus `--remove-label` for any other kind label it has — read from the `labels` of that list (re-kinding). If it
    carries a UC label, stop — it is a UC PR (UC path). Never change its draft/ready state. If the
    branch is ahead of its remote, prepare a `git push` (run in step 8, after the gate).
  - **Hit, `state != OPEN`** → **STOP**, exactly as in step 4.
  - **No hit** → **CREATE**: prepare the push as in step 4 (run in step 8, after the gate), then prepare `gh pr create … --label "<kind>"`. It is
    **ready for review** by default — nothing signals "unfinished" the way `spec.json.phase` does for a
    UC; open it as a draft (`--draft`) only when the user asks.
- **N3. Resolve the kind label** the same way as the UC label (step 5): `gh label list --search "<kind>" --json name`,
  exact (case-insensitive) match; if none, prepare `gh label create "<kind>" --color <color> --description "<…>"`
  before the create/edit — colors `bug` `d73a4a`, `enabler` `0e8a16`, `chore` `cfd3d7`. Reuse an
  existing label as-is. **Exactly one kind label, and never a `UC-<CTX>-NNN` label** — a UC label
  overrides the kind and makes the PR that UC's own.
- **N4. Compose title and body.**
  - **Title**: the project's own PR title convention (as in step 6); no `UC-` prefix and no kind
    prefix (the label carries the kind). On update, change it only if the user asks.
  - **Body** (headings in the `.uneri.json` language; English shown):

    ```markdown
    ## Summary

    - <1-3 bullets from `git log <base>..HEAD` and the diff — why, then what>

    related: UC-CTX-008 (only if it concerns a UC's feature)

    ## Test plan

    - [ ] <the project's own verification commands the user ran or the diff touches>
    - [ ] AI review: /code-review

    🤖 Generated with [Claude Code](https://claude.com/claude-code)
    ```

    Ask only for what is missing and essential (for a `bug`, the observed symptom). `related:` is plain
    text — never a closing keyword (`Closes #n`); linking an Issue is `uneri-skills:issue-upsert`'s concern.
    On update, keep what others wrote and only fill or correct sections.

### Shared

7. **Confirm before writing (mandatory gate).** Show the exact `git push` (if needed) and `gh pr create` / `gh pr edit` /
   `gh pr ready` / `gh label create` commands (`--label` on create, `--add-label` on update) with full title/body, and
   get the user's go-ahead. This gate is not skippable — not for time pressure, not because "the
   user asked for it so consent is implied".

8. **Apply.** Nothing — including `git push` — runs before the gate in step 7 is approved. Run the
   confirmed commands in order (push if needed → `gh label create` if the label is
   missing → create/edit, carrying the label → draft/ready transition) and report the resulting PR number and URL. On failure (auth, network,
   permissions), hand the user the composed commands to run manually — do not lose the work.

## Common mistakes (do NOT repeat)

| ❌ Mistake                                                  | ✅ Correct                                                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Creating a second PR when one already exists for the branch | `gh pr list --head <branch>` first (step 4); an OPEN hit ⇒ **update**, never open a duplicate                    |
| Reopening a closed/merged PR                                | Stop and report it; tell the user to open a new branch instead                                                   |
| Running on `main`                                           | Preconditions stop this before any read/write                                                                    |
| Attaching `--add-label` before the label exists             | Check with `gh label list --search --json name` for an exact name match, create it if missing, then add (step 5) |
| Creating the PR first and labelling it afterwards           | Pass `--label` on `gh pr create` (label created beforehand); `--add-label` is for the update path only (step 5)  |
| Opening a PR with a bare `gh pr create` and no label        | Go through this skill: every PR carries a UC label or exactly one kind label, passed on `gh pr create --label`   |
| Attaching a `UC-<CTX>-NNN` label on the non-UC path         | Kind label only — a UC label makes the PR that UC's own (N3)                                                     |
| Labelling a refactor/migration `chore`                      | It is an `enabler` (planned work); `chore` is small housekeeping (N1)                                            |
| Pushing before the confirmation gate                        | `git push` is an outward write; it is part of the gate's command list and runs only after approval (step 7–8)    |
| Labelling only the first UC when `traces_uc` lists several  | One `--label` per UC-ID (step 5)                                                                                 |
| Always opening a ready-for-review PR                        | Draft while `phase` is below `implemented` (step 3)                                                              |
| Trying to flip a ready PR back to draft                     | `spec.json.phase` only moves forward once `implemented`; ready→draft is out of scope, never attempted            |
| Copying all of `tasks.md` into the PR body                  | Summary is 1-3 bullets; details live in the spec/tasks files the body links to                                   |
| Skipping the confirmation gate                              | External write ⇒ mandatory user gate (step 7), never skipped                                                     |
| Using this skill to link or update a GitHub Issue           | That is `uneri-skills:issue-upsert`; this skill never touches Issues                                             |
| Prefixing the PR title with `UC-<CTX>-NNN:`                 | The label and the Traceability section carry the UC-ID; the title follows the project's own convention (step 6)  |
| Reporting in the wrong language                             | Follow `.uneri.json` `lang`; localize prose, keep IDs/keys verbatim                                              |
| Running without `gh` / outside a GitHub remote              | Stop at precondition 1 (step 1) before any read/write                                                            |
