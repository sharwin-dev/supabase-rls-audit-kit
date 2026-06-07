# Storage Policy Checks

Supabase Storage access is controlled with RLS policies on `storage.objects`.

The audit kit reports:

- Broad client-role policies whose `USING` or `WITH CHECK` expression is simply `true`.
- Authenticated upload policy sets that include `INSERT` but lack `SELECT` or `UPDATE`, which are additionally required for Storage upserts.

## Findings

### `storage-policy-broad-client-access`

Reports policies assigned to `public`, `anon`, or `authenticated` when their access expression is unrestricted.

Restrict Storage policies with explicit boundaries such as:

- `bucket_id`
- object owner
- authenticated user folder
- tenant membership

### `storage-upsert-policy-incomplete`

Reports authenticated `INSERT` coverage without matching `SELECT` and `UPDATE` coverage.

This is a warning because ordinary uploads require only `INSERT`. Add the other policies only when authenticated clients need to overwrite files using upsert.

## Limitations

The checker does not attempt to prove that arbitrary policy expressions are secure. Review all Storage policies and test negative access cases for different users and tenants.
