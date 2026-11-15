---
inclusion: manual
---

# Glossary (<Project>)

Category enums (classification value objects) and core terms — the DDD ubiquitous language.
Loaded on demand (not always-on); the `uneri-*` skills consult it when needed.
**State-transition enums (`status`) describe an aggregate's lifecycle and live in
`domain-model.md`** (do not duplicate them here).

## Category enums (value objects — classifications that do not transition)

### <enum name> `<field>` (<table/storage>)

- `<value-a>`: <meaning>
- `<value-b>`: <meaning>

## State-transition enums (defined in `domain-model.md`)

| Enum             | Values          | Defined in      |
| ---------------- | --------------- | --------------- |
| `<table>.status` | <a> / <b> / <c> | `AGG-<CTX>-001` |

## Core terms

- **UC (use case)**: a user-goal-level unit. Principle `1 UC = 1 spec` (→ `use-cases.md`)
- **<term>**: <single agreed definition used by code, docs, and conversation>
