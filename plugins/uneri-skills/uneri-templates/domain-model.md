---
inclusion: manual
---

# Domain Model (<Project>)

Tactical DDD domain model, organized **per Aggregate as "Command → resulting Event"**
(elicited via a light, retroactive EventStorming). Defines the **Aggregates (`AGG-<CTX>-*`)**
and **Domain Events (`EVT-<CTX>-*`)** that `use-cases.md` references upstream.
ID format: `<TYPE>-<CTX>-<NNN>`.

- **UC ⊇ command**: a UC (user goal) contains one or more commands; each command changes
  aggregate state and raises an event. UCs point here via `realizes` / `aggregates`.
- **Every element is a pair: localized name + English identifier (PascalCase)** —
  aggregate = noun (`Tenant`), command = imperative (`OpenTenant`), event = past tense
  (`TenantOpened`). The English identifier is the canonical name in code.
- Read Models (queries) produce no new facts — list them at the end of each aggregate.
  Event-driven automatic reactions are recorded as Policies.

## AGG-<CTX>-001 <Aggregate name> `<AggregateIdentifier>` (<table/storage>)

| Command                        | UC           | Event                                                      |
| ------------------------------ | ------------ | ---------------------------------------------------------- |
| <Do something> `<DoSomething>` | UC-<CTX>-001 | `EVT-<CTX>-001` <something happened> `<SomethingHappened>` |

- State: `<state-a>` → (`EVT-<CTX>-001`) → `<state-b>`.
- Policy: `<SomethingHappened>` (`EVT-<CTX>-001`) → <automatic reaction>.
- Read Model: <query view> (UC-<CTX>-0NN).

## External Systems

<Third-party systems the domain talks to (not actors — see `actors.md`).>
