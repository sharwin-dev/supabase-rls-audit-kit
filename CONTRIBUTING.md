# Contributing

Contributions are welcome when they improve Supabase/Postgres RLS safety checks, examples, documentation, or tests.

## Good First Contributions

- Add a broken/fixed RLS example.
- Improve finding explanations.
- Add a catalog query test fixture.
- Document a common Supabase security footgun.
- Improve JSON output compatibility.

## Before Opening a PR

Run:

```bash
npm test
npm run lint
```

Keep generated files, secrets, `.env` files, and production schema dumps out of commits.

## Security-Sensitive Changes

If a change affects severity, findings, or policy detection, include:

- the risk being detected,
- a minimal bad example,
- a minimal good example,
- tests that prove both cases.
