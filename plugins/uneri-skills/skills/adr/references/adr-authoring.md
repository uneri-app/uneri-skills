# ADR authoring conventions

The single source of the rules the `adr` skill applies, for writers and reviewers alike.

Strength: **MUST** = required. **SHOULD** = default; deviate only with a reason you can state.
Check: **M** = mechanical (a plain read or search can decide), **J** = judgment (the skill reasons about it).

Contents: [Boundary](#boundary-what-an-adr-is-and-is-not) · [When an ADR is warranted](#when-an-adr-is-warranted)
· [A. What to reference](#a-what-to-reference-and-where) · [B. How to point](#b-how-to-point-at-things)
· [C. Facts and evidence](#c-facts-and-evidence) · [D. What is a decision](#d-what-is-a-decision-and-what-is-not)
· [E. Consistency](#e-consistency-with-other-adrs-and-the-index) · [F. Notation](#f-notation-and-vocabulary)
· [G. Before `accepted`](#g-before-accepted) · [Index](#index) · [Failure patterns](#failure-patterns-symptom-likely-cause-fix)
· [Examples](#examples-fabricated-never-quote-a-real-adr)

## Boundary: what an ADR is, and is not

An ADR records a decision that is read for a long time. Test (D-4): *if the chosen mechanism were swapped for another,
would the ADR text have to change?* If yes, that text belongs in a spec, code comment, or PR description, not the ADR.

## When an ADR is warranted

Write one when the decision changes how the system is built or run, is costly to reverse once code depends on it,
affects people or agents who will work here later, **and** had real alternatives. The test: would someone later need
to know *why*?

### Spec or ADR?

When the project keeps specs (a living `design.md` per feature), most design decisions belong there. Split by lifetime:

- **Stays in the spec**: how this feature is built, and decisions whose scope ends with the feature.
- **Becomes an ADR**: the decision binds other specs or later work, **or** its reason would be lost when the spec is
  revised (specs are rewritten to match reality; ADRs are not), **or** it overturns an earlier ADR.
- **Never both in full**: the ADR holds the choice and why; the spec holds how, and links to the ADR. Do not copy the
  rationale into both places, or one will drift.

Do not write one for a routine choice inside an established pattern, a bug fix, a decision an existing ADR already
records (amend or supersede that one), or what a linter or formatter already enforces.

Typical areas where a decision is worth recording (prompts for recall; the criteria above still decide):

| Area           | Examples                                                          |
| -------------- | ----------------------------------------------------------------- |
| Technology     | framework, language, database, cloud provider                     |
| Architecture   | monolith or services, event-driven, CQRS, layering rules          |
| API            | REST or GraphQL, versioning, authentication scheme                |
| Data           | schema design, normalization, caching, retention                  |
| Infrastructure | deployment model, CI/CD pipeline, monitoring                      |
| Security       | authentication and authorization strategy, encryption, secrets    |
| Testing        | test frameworks, coverage targets, unit versus end-to-end balance |
| Process        | branching strategy, review process, release cadence               |

## A. What to reference, and where

| ID  | Str. | Check | Rule                                                                                           |
| --- | ---- | ----- | ---------------------------------------------------------------------------------------------- |
| A-1 | MUST | M     | No ticket, issue, or PR numbers in the body. External references go in a `References` section. |
| A-2 | MUST | M     | Related and replaced ADRs go in a dedicated header block, not scattered through the prose.     |

## B. How to point at things

| ID  | Str. | Check | Rule                                                                                                                       |
| --- | ---- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| B-1 | MUST | M     | No physical line numbers.                                                                                                  |
| B-2 | MUST | M     | Refer to another ADR's decision as `ADR-NNNN decision 2 (heading)`, so the target survives later additions and file moves. |
| B-3 | MUST | M     | Every relative link resolves to an existing file.                                                                          |

## C. Facts and evidence

| ID  | Str.   | Check | Rule                                                                                                                                                                                    |
| --- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 | MUST   | J     | Check premises against code or a primary source; state the source and the date checked. "Confirmed in a meeting" is not a source.                                                       |
| C-2 | SHOULD | J     | Context describes a problem that **actually happens in this project**, not a hypothetical general one.                                                                                  |
| C-3 | MUST   | J     | The ADR reads on its own: a reader who has never seen the discussion can follow it.                                                                                                     |
| C-4 | MUST   | J     | A decision recorded after the fact (backfill) says so: give the original decision date, and mark the ADR as retrospective. Do not present a reconstruction as a contemporaneous record. |

## D. What is a decision, and what is not

| ID  | Str.   | Check | Rule                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-1 | MUST   | M+J   | No migration plan, progress, task table, or checkbox list. (`[x]`, `進行中`, `To Do` are mechanical signals.)                                                                                                                                                                                                                                                                        |
| D-2 | MUST   | M     | Required sections exist, with **English headings** whatever language the body is in: `Context`, `Options` (or `Alternatives`; "none considered" with a reason is acceptable), `Decision`, `Consequences`, `Revisit conditions`. External references go under `References`. Fixed headings keep the check language-independent and let tools and agents find sections in any project. |
| D-3 | SHOULD | J     | State scope and what is **not** decided at the end of Decision, naming who it is delegated to. The delegate must exist.                                                                                                                                                                                                                                                              |
| D-4 | SHOULD | J     | Decision granularity leaves implementation freedom (see the boundary test). Method names, env vars, migration numbers, file layouts do not belong.                                                                                                                                                                                                                                   |
| D-5 | SHOULD | M     | Length above ~150 lines is a signal that implementation detail or history has leaked in; justify or split.                                                                                                                                                                                                                                                                           |

## E. Consistency with other ADRs and the index

| ID  | Str.   | Check | Rule                                                                                                                                                                                                                                                                                                            |
| --- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E-1 | MUST   | M     | Status is **one value from a closed set** in exactly one place (frontmatter). The body and the index copy it; they never disagree.                                                                                                                                                                              |
| E-2 | MUST   | M     | Status set: `proposed`, `accepted`, `deprecated`, `superseded`, **`partially-superseded`** (names the replaced decision numbers in the header block), and **`rejected`** (considered and deliberately not adopted; kept so it is not proposed again). Prose goes on a separate line, never in the status value. |
| E-3 | MUST   | M     | When status changes, the index row and every ADR that links to it are updated in the same change.                                                                                                                                                                                                               |
| E-4 | MUST   | J     | **Immutability.** A decision is not rewritten in place. A changed decision is a new ADR that supersedes the old one. Allowed in place: typo fixes, link fixes, status line, and a dated *Amendment* note for a clarification that does not change the decision.                                                 |
| E-5 | SHOULD | M     | Index rows carry the title only, ≤ 100 characters; the summary lives in the ADR.                                                                                                                                                                                                                                |

## F. Notation and vocabulary

| ID  | Str.   | Check | Rule                                                                                          |
| --- | ------ | ----- | --------------------------------------------------------------------------------------------- |
| F-1 | SHOULD | J     | Terms, titles, and link text use the project's ubiquitous language consistently.              |
| F-2 | MUST   | M     | No "last updated" or similar fields that go stale. A decision date is fine; it never changes. |
| F-3 | SHOULD | M     | Title states the decision, not the topic ("Adopt X over Y", not "About X").                   |

## G. Before `accepted`

| ID  | Str.   | Check | Rule                                                                                                               |
| --- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------ |
| G-1 | MUST   | J     | No open question left in an `accepted` ADR; unresolved items are moved to "not decided" (D-3) with a delegate.     |
| G-2 | SHOULD | J     | Security-relevant ADRs are checked for completeness (authn/authz, data exposure, failure modes) before acceptance. |

## Index

If the project keeps an index (`README.md` or `index.md` in the ADR directory), it is a table with one row per ADR:
`| [NNNN](./file.md) | title | status |`, in numeric order. The title is the ADR's title; the status is the ADR's
status, copied (E-1). Add the row in the same change that adds the ADR (E-3). `assets/index.md` is a seed.

## Failure patterns (symptom, likely cause, fix)

| Symptom                                                              | Likely cause                                     | Fix                                                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Consequences list only upsides                                       | Cherry-picking                                   | Name what gets harder and the ongoing cost (C-3)                                                                                      |
| Only one option is listed                                            | The decision was made before the ADR was written | Record what was rejected and why it lost (D-2)                                                                                        |
| The decision never says why this option over the others              | The reason lived in someone's head               | Name the runner-up and the deciding factor (C-3)                                                                                      |
| Context reads like a pitch for the solution                          | Problem framing skipped                          | Rewrite it as the problem that happens now; move the solution to Decision (C-2)                                                       |
| Decision reads like a how-to (steps, names, settings)                | Spec detail leaked in                            | Apply the boundary test; move it to the spec or PR (D-4)                                                                              |
| Options are judged on different criteria, so they cannot be compared | Each option was argued on its own terms          | Pick the dimensions once (cost, complexity, scalability, team familiarity, maintenance burden…) and assess every option on them (C-3) |
| A consequence restates the decision                                  | Padding                                          | Replace it with a follow-up, a cost, or a risk, or delete it                                                                          |
| A constraint is vague ("fast enough")                                | Unstated target                                  | Give the measurable bound, or say it is unknown (C-1)                                                                                 |
| The evidence is "agreed in a meeting"                                | No primary source                                | Cite something readable, or move it to "not decided" (C-1, D-3)                                                                       |
| Status or tasks appear in the body                                   | The ADR doubles as a tracker                     | Remove them; keep them in the issue tracker or spec (D-1)                                                                             |
| An old decision is edited to match what happened                     | History rewritten                                | Write a new ADR that supersedes it (E-4)                                                                                              |

## Examples (fabricated; never quote a real ADR)

D-1: NG `- [x] Rolled out to staging` / `- [ ] Roll out to prod by next week`.
OK: "During migration both the old and the new format must be readable."

D-4: NG "Read `ALLOWED_RECIPIENTS` (comma separated), lower-case it, and log a warning instead of throwing."
OK: "Staging must not send mail to any recipient outside an allow-list." (the rest is a spec or PR description)

E-1: NG frontmatter `status: proposed`, body `Status: accepted (approved 2026-07-01)`, index `accepted`.
OK: frontmatter `status: accepted`; the body header shows `accepted` and the approval date on its own line.

E-4: NG editing Decision 2 under a heading "R2 revision". OK: a new ADR "Use Y instead of X" with
`supersedes: decision 2 of the earlier ADR`, and the old ADR becomes `partially-superseded`.
