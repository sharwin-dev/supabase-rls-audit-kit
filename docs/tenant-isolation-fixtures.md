# Tenant-Isolation Fixtures

The tenant-isolation fixture suite contains paired examples for reviewing and testing common RLS isolation patterns.

Fixtures:

```text
examples/fixtures/tenant-isolation/
```

## Included Cases

| Fixture | Classification | Security property |
| --- | --- | --- |
| `good-owner-isolation.sql` | Good | Every operation is constrained to `auth.uid() = owner_id`. |
| `bad-cross-tenant-select.sql` | Bad | `using (true)` allows authenticated users to read every tenant row. |
| `bad-unscoped-insert.sql` | Bad | `with check (true)` allows authenticated users to create rows for another owner. |
| `bad-user-metadata-tenant.sql` | Bad | Authorization trusts user-editable `user_metadata`. |

The manifest at `examples/fixtures/tenant-isolation/manifest.json` records the intended classification and purpose of every fixture.

## Important Limitation

Catalog auditing can identify structural risks such as missing RLS, missing policies, and unsafe metadata references. It cannot prove that arbitrary policy expressions correctly isolate every tenant.

Use these fixtures as review and test inputs, then verify real policies with negative cross-tenant database tests. A good test must confirm that one tenant cannot read, insert, update, or delete another tenant's rows.

For local Supabase projects, policy-level tests can be run with:

```bash
supabase test db
```
