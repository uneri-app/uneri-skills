---
name: verify-completion
description: Verify completion and success claims with fresh evidence. Use before claiming a task is complete, a fix works, tests pass, a failure is unrelated or pre-existing, or a feature is ready for GO, and when writing the report that states them.
allowed-tools: Read, Grep, Glob
argument-hint: <claim-type> <claim>
---

# uneri-skills:verify-completion

## Overview

This skill prevents false completion claims. A task, fix, or feature is only complete when supported by fresh evidence that matches the scope of the claim.

## When to use

- Before saying a task is complete
- Before saying a bug is fixed
- Before saying tests pass
- Before moving to the next task in autonomous execution
- Before reporting `GO` from feature-level validation
- Before saying a failure is unrelated to your change, pre-existing, or caused by something specific
- When writing a final or progress report that states results (see *Reporting*)
- Before trusting another subagent's success report

Do not use this skill for early planning or speculative status updates.

## Inputs

Provide:

- The exact claim to verify
- Claim type:
  - `TASK`
  - `FIX`
  - `TEST_OR_BUILD`
  - `FEATURE_GO`
  - `CAUSE` (a claim about why something fails, or that a failure is unrelated or pre-existing)
- Validation commands discovered by the controller
- Fresh command output and exit codes
- The tests, mocks and fixtures that you changed or deleted in the same change (the list, not a summary)
- Relevant task IDs, requirement IDs, and design refs where applicable
- For feature-level claims:
  - requirements coverage status
  - design alignment status
  - integration status
  - blocked task status

## Outputs

Return one of:

- `VERIFIED`
- `NOT_VERIFIED`
- `MANUAL_VERIFY_REQUIRED`

Also return:

- Claim reviewed
- Evidence used
- Scope/evidence mismatch, if any

Use the language specified in `spec.json`.

## Gate Function

1. Identify the exact claim.
2. Identify the exact command or checklist that proves that claim.
3. Require fresh evidence from the current code state.
4. Check exit code, failure count, skipped scope, and missing coverage.
5. Reject claims that are broader than the evidence.
6. If mandatory validation cannot be completed, return `MANUAL_VERIFY_REQUIRED`.
7. Only then allow the claim.

## Claim-Specific Rules

### TASK

Require:

- task-local verification evidence
- no unresolved blocking findings from review
- evidence aligned with the task boundary

### FIX

Require:

- evidence that the original symptom is resolved
- no broader regressions in the relevant verification scope

### TEST_OR_BUILD

Require:

- actual command output
- exit code
- the number of tests or checks that actually ran: exit code 0 with zero tests run proves only that the code compiles, so say that
- no inference from unrelated checks
- if you changed the tests, mocks or fixtures that produced the result, say so and list them: a pass that you edited into place is weaker evidence than a pass on untouched tests. Deleted tests and loosened assertions are the first things to list

### CAUSE

Require:

- a comparison against a baseline: the same command run on the unchanged base (for example a clean checkout of the base branch), showing the failure is, or is not, there
- the mechanism, shown by evidence (a version diff, an error message that names the cause, a bisect result)
- otherwise label it a **hypothesis**, never a finding: do not write "unrelated", "pre-existing" or "caused by X" without the baseline run

### FEATURE_GO

Require:

- full test suite result
- runtime smoke boot result showing the built artifact reaches its first usable state
- requirements coverage assessment
- cross-task integration assessment
- design end-to-end alignment assessment
- blocked tasks assessment

A passing test suite alone is not enough for `FEATURE_GO`.

## Reporting

A report that states results must separate what was verified from what was not.

- Attach to every claim the command you ran and its result. A claim with no command is an opinion; mark it as one.
- Include an **Unverified** section. List what you did not run or could not check (runtime behaviour in a real browser or server, other environments, tests that do not exist). If there is nothing, write "none".
- Do not mix hedged wording ("mostly", "should", "probably") with verified facts. Put it under Unverified.
- For a refactor or migration, list every place where behaviour changed (a defensive check replaced by trust in a type, a value that is now rejected or dropped, a default that moved). If none, write "none".
- Do not report progress as a percentage or as "almost done". Report what is verified and what remains.

## Stop / Escalate

Return `MANUAL_VERIFY_REQUIRED` when:

- No canonical validation command is known
- The required environment is unavailable
- A mandatory manual verification step cannot be executed

Return `NOT_VERIFIED` when:

- The command failed
- Evidence is stale
- Evidence is partial
- The claim exceeds the evidence
- The feature still has unresolved blocked tasks or uncovered requirements

## Common Rationalizations

| Rationalization                                         | Reality                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| “The subagent said it succeeded”                        | Reported success is not verification evidence.                                                   |
| “Tests passed earlier”                                  | Fresh evidence only.                                                                             |
| “Build should be fine because lint passed”              | Lint does not prove build success.                                                               |
| “Tests passed and build succeeded, so it must run”      | Type erasure, module loading, native ABI, and boot-time config issues can still fail at runtime. |
| “The feature is done because all tasks are checked off” | `FEATURE_GO` also requires coverage, integration, and design alignment.                          |
| “That failure is unrelated to my change”                | Run the same command on the unchanged base. Without it, it is a hypothesis.                      |
| “The tests pass” (after editing those tests)            | List what you changed. A pass on tests you edited is weaker evidence.                            |
| “Exit code 0, so it passed”                             | Check how many tests ran. Zero tests run proves nothing.                                         |

## Output Format

```md
## Verification Result

- STATUS: VERIFIED | NOT_VERIFIED | MANUAL_VERIFY_REQUIRED
- CLAIM_TYPE: TASK | FIX | TEST_OR_BUILD | CAUSE | FEATURE_GO
- CLAIM: <exact claim>
- EVIDENCE: <command/checklist and result>
- CHANGED_TESTS: <tests, mocks and fixtures changed or deleted in this change, or "none">
- BEHAVIOUR_CHANGES: <places where behaviour changed, or "none">
- UNVERIFIED: <what was not run or could not be checked, or "none">
- GAPS: <scope/evidence mismatch or missing validation>
- NOTES: <next action if not verified>
```
