# Local Supabase Audit Example

This example uses the default database URL printed by `supabase start`:

```bash
rls-audit \
  --database-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --format json > rls-audit-report.json
```

Recommended local loop:

```bash
supabase start
supabase db reset
rls-audit --database-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

Use `supabase status` if your local ports are different.
