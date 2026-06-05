# Supabase CLI Local Usage

Use the Supabase CLI local stack to audit RLS posture before pushing database changes.

This flow is useful when your project keeps schema changes in `supabase/migrations` and you want a fast local check before opening a pull request.

## Prerequisites

- Supabase CLI installed.
- Docker or a Docker-compatible container runtime running.
- Node.js 20 or later.
- A local Supabase project created with `supabase init`.

## Basic Flow

Start the local Supabase stack:

```bash
supabase start
```

Apply committed migrations to the local database:

```bash
supabase db reset
```

Run the audit against the default local Postgres URL:

```bash
rls-audit \
  --database-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --format text
```

Write a JSON report:

```bash
rls-audit \
  --database-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --format json > rls-audit-report.json
```

## Suggested Package Script

In an application repo that installs this tool as a dev dependency:

```json
{
  "scripts": {
    "audit:rls:local": "rls-audit --database-url postgresql://postgres:postgres@127.0.0.1:54322/postgres --format text"
  }
}
```

Then run:

```bash
npm run audit:rls:local
```

## Notes

- `supabase start` prints the current local database URL. Use that value if your local ports differ.
- `supabase db reset` recreates the local database and applies migrations. Save local-only schema or data changes before running it.
- The local default password is fine for local development, but do not copy production database URLs into package scripts or committed files.
- This tool runs read-only catalog queries. It does not replace policy-level tests such as pgTAP tests run with `supabase test db`.

## Troubleshooting

If the audit cannot connect:

1. Confirm the local stack is running with `supabase status`.
2. Confirm the database URL from `supabase start` or `supabase status`.
3. Confirm Docker is running.
4. Run `supabase db reset` again if migrations did not apply cleanly.
