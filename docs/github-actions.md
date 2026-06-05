# GitHub Actions Usage

Run `rls-audit` in CI to catch common Supabase/Postgres RLS footguns before database changes merge.

Example workflow:

```text
examples/github-action/rls-audit.yml
```

The workflow expects a GitHub Actions secret named `SUPABASE_DATABASE_URL`.

Use a preview, staging, or read-only database URL when possible. Avoid running audit checks against production with broad credentials unless you have reviewed the target project, role permissions, and CI log access.

## Setup

1. Add `SUPABASE_DATABASE_URL` under repository or organization Actions secrets.
2. Install this package in the repository where you want to run the audit.
3. Copy `examples/github-action/rls-audit.yml` into `.github/workflows/rls-audit.yml`.
4. Adjust the install command if you consume the package from npm, GitHub, or a local workspace.

## Behavior

The example writes JSON output to `rls-audit-report.json` and uploads it as a workflow artifact.

The CLI exits with code `2` when any `HIGH` finding is present, so the workflow fails on likely access-control vulnerabilities while preserving the report for review.

## Secret Handling

- Do not hardcode database URLs in workflow files.
- Do not echo `SUPABASE_DATABASE_URL` in logs.
- Prefer credentials scoped to catalog reads needed by the audit.
- Use separate secrets for staging and production if you run both.
