# supabase-rls-audit-kit

Small CLI checks for common Supabase/Postgres Row Level Security footguns.

This project is for indie SaaS builders and maintainers who want a repeatable way to inspect public-schema RLS posture before shipping database changes.

## What It Checks

- Tables in exposed schemas with RLS disabled.
- Tables with RLS enabled but no policies.
- Grants to `anon` or `authenticated` on tables.
- Policies that reference unsafe user-editable JWT metadata.
- `SECURITY DEFINER` functions in exposed schemas.
- Functions executable by `anon` or `authenticated`.
- Views in exposed schemas that may bypass RLS.

## Install

```bash
npm install
```

## Run

```bash
DATABASE_URL="postgres://..." npm start -- --format text
```

Or after linking/installing:

```bash
rls-audit --database-url "$DATABASE_URL"
```

JSON output:

```bash
rls-audit --database-url "$DATABASE_URL" --format json
```

The JSON contract is documented in [`docs/json-output.md`](docs/json-output.md), with a schema at [`schemas/finding.schema.json`](schemas/finding.schema.json).

## Safety

The CLI runs read-only catalog queries. It does not mutate the database.

Do not run it with production credentials unless you understand the connection target and access scope. Prefer read-only or temporary credentials where possible.

## Severity Model

- `HIGH`: likely access-control vulnerability or exposed privileged path.
- `MEDIUM`: missing policy/guardrail that may be safe only if intentionally private.
- `WARN`: review-needed pattern.

## Examples

See:

- [`examples/bad`](examples/bad)
- [`examples/good`](examples/good)

## Development

```bash
npm test
npm run lint
```

## Maturity

This is an early-stage audit helper. It is not a replacement for manual security review, Supabase advisors, or a production threat model.
