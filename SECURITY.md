# Security Policy

This project helps inspect Supabase/Postgres RLS posture. It should not receive secrets, production data, or customer records in issues.

## Reporting Issues

Open a GitHub issue for normal bugs.

For a sensitive vulnerability in this tool, contact the maintainer privately through the GitHub profile associated with this repository.

## Scope

In scope:

- Unsafe catalog checks.
- False negatives in documented checks.
- CLI behavior that leaks credentials.
- Dependency or packaging risks.

Out of scope:

- Private application-specific RLS audits.
- Requests to review production credentials or customer data.

## Handling Database URLs

Do not paste real `DATABASE_URL` values into issues. Redact hostnames, usernames, passwords, and project identifiers.
