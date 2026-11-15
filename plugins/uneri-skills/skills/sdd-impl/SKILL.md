---
name: sdd-impl
description: Implement approved tasks using TDD with native subagent dispatch. Runs all pending tasks autonomously to the end, or selected tasks manually. Refuses to start until the spec's tasks are approved. Triggers include "implement this spec", "タスクを実装して", "実装を進めて", "spec impl". Takes `{feature-name} [task-numbers]`.
allowed-tools: Read, Grep, Glob
argument-hint: <feature-name> [task-numbers]
---

# uneri-skills:sdd-impl Skill

## Role

You operate in two modes:

- **Autonomous mode** (no task numbers): Dispatch a fresh subagent per task, with independent review after each
- **Manual mode** (task numbers provided): Execute selected tasks directly in the main context

## Core Mission

- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements
  - Independent reviewer approves each task before completion

## Model Selection

Every subagent dispatch (implementer, reviewer, debugger) **must pass an explicit model** — an
omitted model silently inherits the parent session's model, which is usually the most capable and
most expensive one, defeating the point of this section. Choose the least powerful model that can
still do the role correctly:

- **Implementer, task has pinned `Files:`/`Interfaces:` in tasks.md** (see `uneri-skills:sdd-tasks`): the
  design already decided the shape; implementation is close to transcription-plus-testing → cheapest
  available tier.
- **Implementer, task touches 1-2 files with a complete, unambiguous spec but no pinned
  `Files:`/`Interfaces:`**: fast/cheap tier still applies for most such tasks.
- **Implementer, task requires multi-file coordination, pattern-matching against existing code, or
  judgment calls design.md left open**: standard tier.
- **Implementer, task requires architecture/design judgment or broad codebase understanding beyond
  what design.md pins**: most capable available tier — this is a design gap surfacing at
  implementation time, not a mechanical task; consider whether it should route back to `sdd-design`
  instead of being implemented ad hoc.
- **Reviewer**: scale to the diff's size, complexity, and risk, not automatically to the implementer's
  tier — a small mechanical diff does not need the most capable model, but a subtle concurrency or
  security-relevant change does regardless of how cheap the implementer was.
- **Debug subagent, rounds 1-2**: standard tier by default.
- **Fix-loop / debug escalation**: each re-dispatch after a rejection or a failed debug round uses a
  model **at least one tier above** the one that just got stuck — never re-run the identical
  implementer/model combination unchanged and expect a different outcome.
- **Turn count beats token price**: the cheapest tier routinely takes more turns to converge on
  multi-step work, which can cost more overall in wall-clock and context than a mid-tier model that
  finishes in fewer turns. Use a mid-tier floor for reviewers and for any implementer working from a
  task that has no pinned `Files:`/`Interfaces:` (i.e. is working from prose, not a transcription-ready
  spec).

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:

- `.kiro/specs/{feature}/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the selected task's boundary, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect implementation or validation
- Relevant local agent skills or playbooks only when they clearly match the task's host environment or use case; read the specific artifact(s) you need, not entire directories

#### Parallel Research

The following research areas are independent and can be executed in parallel:

1. **Spec context loading**: spec.json, requirements.md, design.md, tasks.md
2. **Steering, playbooks, & patterns**: Core steering, task-relevant extra steering, matching local agent skills/playbooks, and existing code patterns

After all parallel research completes, synthesize implementation brief before starting.

#### Preflight

**Validate approvals**:

- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

**Discover validation commands**:

- Inspect repository-local sources of truth in this order: project scripts/manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, app manifests), task runners (`Makefile`, `justfile`), CI/workflow files, existing e2e/integration configs, then `README*`
- Derive a canonical validation set for this repo: `TEST_COMMANDS`, `BUILD_COMMANDS`, and `SMOKE_COMMANDS`
- Prefer commands already used by repo automation over ad hoc shell pipelines
- For `SMOKE_COMMANDS`, choose the lightest trustworthy runtime-liveness check for the app shape (for example: root URL load, Electron launch, CLI `--help`, service health endpoint, mobile simulator/e2e harness if one already exists)
- Keep the full command set in the parent context, and pass only the task-relevant subset to implementer and reviewer subagents

**Establish repo baseline**:

- Run `git status --porcelain` and note any pre-existing uncommitted changes

### Step 2: Select Tasks & Determine Mode

**Parse arguments**:

- Extract feature name from first argument
- If task numbers provided (e.g., "1.1" or "1,2,3"): **manual mode**
- If no task numbers: **autonomous mode** (all pending tasks)

**Build task queue**:

- Read tasks.md, identify actionable sub-tasks (X.Y numbering like 1.1, 2.3)
- Major tasks (1., 2.) are grouping headers, not execution units
- **Parent rollup**: a major task's checkbox is never worked directly. Each time a sub-task is marked `[x]`, re-scan its siblings: if **every** sub-task under that major (e.g. all `2.x`) is now `[x]`, also flip that major's `- [ ] N` to `- [x] N` in the same `tasks.md` write. This is presentation-only, so a fully-completed group no longer reads as unfinished — it is **never** a gate. A major with any sub-task not yet `[x]` (including `_Blocked:_` ones) stays `- [ ]`.
- Skip tasks with `_Blocked:_` annotation
- For each selected task, check `_Depends:_` annotations -- verify referenced tasks are `[x]`
- If prerequisites incomplete, execute them first or warn the user
- Use `_Boundary:_` annotations to understand the task's component scope

### Step 3: Execute Implementation

#### Autonomous Mode (subagent dispatch)

**Iteration discipline**: Process exactly ONE sub-task (e.g., 1.1) per iteration. Do NOT batch multiple sub-tasks into a single subagent dispatch. Each iteration follows the full cycle: dispatch implementer → review → commit → re-read tasks.md → next.

**Context management**: At the start of each iteration, re-read `tasks.md` to determine the next actionable sub-task. Do NOT rely on accumulated memory of previous iterations. After completing each iteration, retain only a one-line summary (e.g., "1.1: READY_FOR_REVIEW, 3 files changed") and discard the full status report and reviewer details.

For each task (one at a time):

**a) Dispatch implementer**:

- Read `templates/implementer-prompt.md` from this skill's directory
- Construct a prompt by combining the template with task-specific context:
  - Task description and boundary scope
  - Paths to spec files: requirements.md, design.md, tasks.md
  - Exact requirement and design section numbers this task must satisfy (using source numbering, NOT invented `REQ-*` aliases)
  - Task-relevant steering context and parent-discovered validation commands (tests/build/smoke as relevant)
  - Whether the task is behavioral (Feature Flag Protocol) or non-behavioral
  - **Previous learnings**: Include any `## Implementation Notes` entries from tasks.md that are relevant to this task's boundary or dependencies (e.g., "better-sqlite3 requires separate rebuild for Electron"). This prevents the same mistakes from recurring.
  - `tasks.md`'s `## Global Constraints` section and, on the task itself, any pinned `Files:`/`Interfaces:` lines (see `uneri-skills:sdd-tasks`) — when present, these are authoritative and the implementer builds its Task Brief from them instead of re-deriving file/signature decisions from scratch
- The implementer subagent will read the spec files and build its own Task Brief (acceptance criteria, completion definition, design constraints, verification method) before implementation
- Dispatch via **Agent tool** as a fresh subagent, **with an explicit `model` chosen per Model Selection** — never omit it

**b) Handle implementer status**:

- Parse implementer status only from the exact `## Status Report` block and `- STATUS:` field.
- If `STATUS` is missing, ambiguous, or replaced with prose, re-dispatch the implementer once requesting the exact structured status block only. Do NOT proceed to review without a parseable `READY_FOR_REVIEW | BLOCKED | NEEDS_CONTEXT` value.
- **READY_FOR_REVIEW** → proceed to review
- **BLOCKED** → dispatch debug subagent (see section below); do NOT immediately skip
- **NEEDS_CONTEXT** → re-dispatch once with the requested additional context; if still unresolved → dispatch debug subagent

**c) Dispatch reviewer**:

- Read `templates/reviewer-prompt.md` from this skill's directory
- Construct a review prompt with:
  - The task description and relevant spec section numbers
  - Paths to spec files (requirements.md, design.md) so the reviewer can read them directly
  - The implementer's status report (for reference only — reviewer must verify independently)
- The reviewer must apply the `uneri-skills:review` protocol to this task-local review.
- Preserve the existing task-specific context: task text, spec refs, `_Boundary:_` scope, validation commands, implementer report, and the actual `git diff` as the primary source of truth.
- The reviewer subagent will run `git diff` itself to read the actual code changes and verify against the spec
- If the task pinned `Interfaces:` in tasks.md, tell the reviewer to check the actual code's public signatures against it verbatim, not just against design.md's prose
- Dispatch via **Agent tool** as a fresh subagent, **with an explicit `model` chosen per Model Selection** (scaled to the diff's size/risk, not automatically to the implementer's tier) — never omit it

**d) Handle reviewer verdict**:

- Parse reviewer verdict only from the exact `## Review Verdict` block and `- VERDICT:` field.
- If `VERDICT` is missing, ambiguous, or replaced with prose, re-dispatch the reviewer once requesting the exact structured verdict only. Do NOT mark the task complete, commit, or continue to the next task without a parseable `APPROVED | REJECTED` value.
- **APPROVED** → before marking the task `[x]` or making any success claim, apply `uneri-skills:verify-completion` using fresh evidence from the current code state; then mark task `[x]` in tasks.md (applying **Parent rollup**) and perform selective git commit
- **REJECTED (round 1-2)** → re-dispatch implementer with review feedback, **one model tier above** the rejected attempt (per Model Selection) — do not silently retry the identical model
- **REJECTED (round 3)** → dispatch debug subagent (see section below)

**e) Commit** (parent-only, selective staging):

- Stage only the files actually changed for this task, plus tasks.md
- **NEVER** use `git add -A` or `git add .`
- Use `git add <file1> <file2> ...` with explicit file paths
- Commit message format: `feat(<feature-name>): <task description>`

**f) Record learnings**:

- If this task revealed cross-cutting insights, append a one-line note **under the `## Implementation Notes` heading, which is the LAST section of tasks.md** (pre-seeded by `/uneri-skills:sdd-tasks`). Append below the existing notes; never insert the heading between task groups. If the section is somehow missing, create it once at the very end of the file — **below every task group, never after the last *completed* task** (remaining unchecked tasks must always stay above it).

**g) Debug subagent** (triggered by BLOCKED, NEEDS_CONTEXT unresolved, or REJECTED after 2 remediation rounds):

The debug subagent runs in a **fresh context** — it receives only the error information, not the failed implementation history. This avoids the context pollution that causes infinite retry loops.

- Read `templates/debugger-prompt.md` from this skill's directory
- Construct a debug prompt with:
  - The error description / blocker reason / reviewer rejection findings
  - `git diff` of the current uncommitted changes
  - The task description and relevant spec section numbers
  - Paths to spec files so the debugger can read them
- The debugger must apply the `uneri-skills:debug` protocol to this failure investigation.
- Preserve rich failure context: error output, reviewer findings, current `git diff`, task/spec refs, and any relevant Implementation Notes.
- When available, the debugger should inspect runtime/config state and use web or official documentation research to validate root-cause hypotheses before proposing a fix plan.
- Dispatch via **Agent tool** as a fresh subagent, **with an explicit `model` chosen per Model Selection** (standard tier for rounds 1-2) — never omit it

**Handle debug report**:

- Parse `NEXT_ACTION` from the debug report's exact structured field.
- If `NEXT_ACTION: STOP_FOR_HUMAN` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, stop the feature run, and report that human review is required before continuing
- If `NEXT_ACTION: BLOCK_TASK` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, skip to next task
- If `NEXT_ACTION: RETRY_TASK` → preserve the current worktree; do NOT reset or discard unrelated changes. Spawn a **new** implementer subagent with the debug report's `FIX_PLAN`, `NOTES`, and the current `git diff`, and require it to repair the task with explicit edits only. Use a model at least one tier above the implementer that got stuck (per Model Selection)
  - If the new implementer succeeds (READY_FOR_REVIEW → reviewer APPROVED) → normal flow
  - If the new implementer also fails → repeat debug cycle (max 2 debug rounds total). After 2 failed debug rounds → append `_Blocked: debug attempted twice, still failing — <ROOT_CAUSE>_` to tasks.md, skip
- **Max 2 debug rounds per task**. Each round: fresh debug subagent → fresh implementer. If still failing after 2 rounds, the task is blocked.
- Record debug findings under the `## Implementation Notes` heading — the LAST section of tasks.md (this helps subsequent tasks avoid the same issue). Same placement rule as (f): append below existing notes, never above unchecked task groups.

**`(P)` markers**: Tasks marked `(P)` in tasks.md indicate they have no inter-dependencies and could theoretically run in parallel. However, uneri-skills:sdd-impl processes them sequentially (one at a time) to avoid git conflicts and simplify review. The `(P)` marker is informational for task planning, not an execution directive.

**Completion check**: If all remaining tasks are BLOCKED, stop and report blocked tasks with reasons to the user.

#### Manual Mode (main context)

For each selected task:

**1. Build Task Brief**:
If the task in tasks.md already carries `Files:`/`Interfaces:` lines, treat them as authoritative and
skip re-deriving file/signature decisions. Otherwise, before writing any code, read the relevant
sections of requirements.md and design.md for this task and clarify:

- What observable behaviors must be true when done (acceptance criteria)
- What files/functions/tests must exist (completion definition)
- What technical decisions to follow from design.md (design constraints)
- How to confirm the task works (verification method)

**2. Execute TDD cycle** (Kent Beck's RED → GREEN → REFACTOR):

- **RED**: Write test for the next small piece of functionality based on the acceptance criteria. Test should fail.
- **GREEN**: Implement simplest solution to make test pass, following the design constraints.
- **REFACTOR**: Improve code structure, remove duplication. All tests must still pass.
- **VERIFY**: All tests pass (new and existing), no regressions. Confirm verification method passes.
- **REVIEW**: Apply `uneri-skills:review` before marking the task complete. If the host supports fresh subagents in manual mode, use a fresh reviewer; otherwise perform the review in the main context using the `uneri-skills:review` protocol. Do NOT continue until the verdict is parseably `APPROVED`.
- **MARK COMPLETE**: Only after review returns `APPROVED`, apply `uneri-skills:verify-completion`, then update the checkbox from `- [ ]` to `- [x]` in tasks.md. Then apply **Parent rollup** (if every sibling sub-task under the major is `[x]`, flip the major to `[x]`).

### Step 4: Final Validation

**Autonomous mode**:

- After all tasks complete, run `/uneri-skills:sdd-validate-impl {feature}` as a GO/NO-GO gate
- If validation returns GO → before reporting feature success, apply `uneri-skills:verify-completion` to the feature-level claim using the validation result and fresh supporting evidence
- If validation returns NO-GO:
  - Fix only concrete findings from the validation report
  - Cap remediation at 3 rounds; if still NO-GO, stop and report remaining findings
- If validation returns MANUAL_VERIFY_REQUIRED → stop and report the missing verification step

**Manual mode**:

- Suggest running `/uneri-skills:sdd-validate-impl {feature}` but do not auto-execute

## Feature Flag Protocol

For tasks that add or change behavior, enforce RED → GREEN with a feature flag:

1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase (env var, config constant, boolean, conditional -- agent chooses the mechanism)
2. **RED -- flag OFF**: Write tests for the new behavior. Run tests → must FAIL. If tests pass with flag OFF, the tests are not testing the right thing. Rewrite.
3. **GREEN -- flag ON + implement**: Enable the flag, write implementation. Run tests → must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

**Skip this protocol for**: refactoring, configuration, documentation, or tasks with no behavioral change.

## Code Comment Convention — why, not what (with trace pointer)

Comments are **optional**; this convention governs their *form* when written, not whether to write
them. Avoid comments that merely restate *what* the code does (enforced as an advisory cleanup, not a
hard gate — see the reviewer's item 12). When a comment is warranted, write:

1. **The local "why"** — the rationale that would be lost if you only read the code: a rejected or
   deferred alternative, a trap that breaks if touched, or an external constraint not visible in the
   code (e.g. "the server is the final authority; this is UX pre-emption").
2. **A trace pointer** — when the comment references a requirement, anchor it with the spec slug and
   requirement number so the reference resolves globally:

   ```
   // <local why: rejected alternative / hidden trap / external constraint>
   // (spec: <slug> / requirements <n.n>[, <n.n> ...])
   ```

   - The spec slug + requirement number are the **required anchor**. The slug is globally unique
     across `.kiro/specs/*`, so `code → <slug>/requirements.md#<n.n> → spec.json.traces_uc → UC`
     resolves without ambiguity. Do NOT write the UC id in the comment — it lives in
     `spec.json.traces_uc`.
   - A `design.md` reference is **optional** and should usually be omitted: design evolves, so
     pinning it in a comment invites drift. Durable design rationale belongs in `design.md` itself.
   - Comment syntax (`//`, `#`, `/* */`) follows the language; the annotation text is identical
     across languages.
3. **Provenance rule** — the "why" you write must be traceable to `requirements.md`, `design.md`, or
   steering, or be a verified external fact you cite. Never invent a plausible-sounding rationale. If
   the "why" cannot be sourced, do not fabricate one — report **NEEDS_CONTEXT** (same discipline as
   "do not guess or fill gaps with assumptions").

`uneri-skills:sdd-trace` does **not** audit code comments; this convention is a form guideline, not a gate.

## Critical Constraints

- **Explicit Model Per Dispatch**: Every implementer/reviewer/debugger dispatch passes an explicit `model` chosen per Model Selection — never let a subagent inherit the parent session's model by omission
- **Strict Handoff Parsing**: Never infer implementer `STATUS` or reviewer `VERDICT` from surrounding prose; only the exact structured fields count
- **No Destructive Reset**: Never use `git checkout .`, `git reset --hard`, or similar destructive rollback inside the implementation loop
- **Selective Staging**: NEVER use `git add -A` or `git add .`; always stage explicit file paths
- **Bounded Review Rounds**: Max 2 implementer re-dispatch rounds per reviewer rejection, then debug
- **Bounded Debug**: Max 2 debug rounds per task (debug + re-implementation per round); if still failing → BLOCKED
- **Bounded Remediation**: Cap final-validation remediation at 3 rounds
- **Comment Convention**: When a code comment references a requirement, anchor it with `(spec: <slug> / requirements <n.n>)` and write *why* (rationale/constraint), never *what*; never fabricate a rationale — an unsourceable "why" is a `NEEDS_CONTEXT`, not a guess. See **Code Comment Convention**.
- **Implementation Notes stay last**: `## Implementation Notes` is always the final section of tasks.md. Never insert it between task groups and never split the task list around it — appending a note must not push unchecked tasks below the heading.
- **No Manual Wait for Subagents**: After dispatching an implementer/reviewer/debugger via the Agent tool, do not call `ScheduleWakeup` or any other wait/poll mechanism to "wait" for it — subagent completion already arrives as an automatic notification. `ScheduleWakeup` is reserved for `/loop` dynamic-pacing sessions, not for `sdd-impl` dispatch.

## Output Description

**Autonomous mode**: For each task, report:

1. Task ID, implementer status, reviewer verdict
2. Files changed, commit hash
3. After all tasks: final validation result (GO/NO-GO)

**Manual mode**:

1. Tasks executed: task numbers and test results
2. Status: completed tasks marked in tasks.md, remaining tasks count

**Format**: Concise, in the language specified in spec.json.

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:

- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `/uneri-skills:sdd-requirements`, `/uneri-skills:sdd-design`, `/uneri-skills:sdd-tasks`"

**Test Failures**:

- **Do not move on with a failing test**: route it through the task's review/remediation loop (`uneri-skills:debug`),
  fix, and re-run — then keep going. The loop is bounded by *Bounded Review Rounds* and *Bounded Debug*
  (max 2 + 2 rounds); a task still failing after that is marked `_Blocked:_` and reported — it does not stop
  the run at the first red test

**All Tasks Blocked**:

- Stop and report all blocked tasks with reasons
- Human review needed to resolve blockers

**Spec Conflicts with Reality**:

- If a requirement or design conflicts with reality (API doesn't exist, platform limitation), block the task with `_Blocked: <reason>_` -- do not silently work around it

**Upstream Ownership Detected**:

- If review, debug, or validation shows that the root cause belongs to an upstream, foundation, shared-platform, or dependency spec, do not patch around it inside the downstream feature
- Route the fix back to the owning upstream spec, keep the downstream task blocked until that contract is repaired, and re-run validation/smoke for dependent specs after the upstream fix lands

**Task Plan Invalidated During Implementation**:

- If debug returns `NEXT_ACTION: STOP_FOR_HUMAN` because of task ordering, boundary, or decomposition problems, stop and return for human review of `tasks.md` or the approved plan instead of forcing a code workaround
