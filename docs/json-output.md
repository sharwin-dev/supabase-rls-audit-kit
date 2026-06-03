# JSON Output

`rls-audit --format json` emits a stable object with one top-level `findings` array.

Schema:

```text
schemas/finding.schema.json
```

Example:

```json
{
  "findings": [
    {
      "id": "table-rls-disabled",
      "severity": "HIGH",
      "object": "public.clients",
      "message": "Table is in an exposed schema but RLS is disabled.",
      "remediation": "Enable RLS and add policies that match the table access model."
    }
  ]
}
```

## Finding Fields

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable check identifier. |
| `severity` | string | One of `HIGH`, `MEDIUM`, or `WARN`. |
| `object` | string | Database object name, usually schema-qualified. |
| `message` | string | Human-readable finding summary. |
| `remediation` | string | Human-readable fix guidance. |

## Severity Values

- `HIGH`: likely access-control vulnerability or exposed privileged path.
- `MEDIUM`: missing policy/guardrail that may be safe only if intentionally private.
- `WARN`: review-needed pattern.

## CI Behavior

The CLI exits with code `2` when any `HIGH` finding is present.

This lets CI fail on likely unsafe access-control posture while still allowing downstream tools to parse the JSON report.
