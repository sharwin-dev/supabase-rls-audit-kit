const exposedName = (row, key = "table_name") => `${row.schema_name}.${row[key]}`;

export function evaluateCatalog(catalog) {
  const findings = [];

  for (const table of catalog.tables ?? []) {
    const name = exposedName(table);

    if (!table.rls_enabled) {
      findings.push({
        id: "table-rls-disabled",
        severity: "HIGH",
        object: name,
        message: "Table is in an exposed schema but RLS is disabled.",
        remediation: "Enable RLS and add policies that match the table access model."
      });
    }

    if (table.rls_enabled && Number(table.policy_count) === 0) {
      findings.push({
        id: "table-no-policies",
        severity: "MEDIUM",
        object: name,
        message: "Table has RLS enabled but no policies.",
        remediation: "Add explicit SELECT/INSERT/UPDATE/DELETE policies, or document why all access should be denied."
      });
    }

    if (table.references_user_metadata) {
      findings.push({
        id: "policy-user-metadata",
        severity: "HIGH",
        object: name,
        message: "A policy references user-editable metadata.",
        remediation: "Do not authorize with raw_user_meta_data/user_metadata. Use app_metadata or database tables controlled by trusted code."
      });
    }
  }

  for (const grant of catalog.grants ?? []) {
    findings.push({
      id: "role-table-grant",
      severity: grant.grantee === "anon" ? "HIGH" : "MEDIUM",
      object: exposedName(grant),
      message: `Role ${grant.grantee} has table privileges: ${grant.privileges}.`,
      remediation: "Confirm the grant is intentional and protected by RLS policies where row access is exposed."
    });
  }

  for (const fn of catalog.functions ?? []) {
    const name = exposedName(fn, "function_name");

    if (fn.security_definer) {
      findings.push({
        id: "security-definer-exposed-schema",
        severity: "HIGH",
        object: name,
        message: "SECURITY DEFINER function is in an exposed schema.",
        remediation: "Move privileged functions to a private schema and tightly control EXECUTE privileges."
      });
    }

    if (fn.anon_execute || fn.authenticated_execute) {
      const roles = [
        fn.anon_execute ? "anon" : null,
        fn.authenticated_execute ? "authenticated" : null
      ].filter(Boolean).join(", ");

      findings.push({
        id: "function-executable-by-client-role",
        severity: fn.anon_execute ? "HIGH" : "MEDIUM",
        object: name,
        message: `Function is executable by client role(s): ${roles}.`,
        remediation: "Revoke EXECUTE from client roles unless this function is intentionally part of the public API."
      });
    }
  }

  for (const view of catalog.views ?? []) {
    if (!view.security_invoker) {
      findings.push({
        id: "view-not-security-invoker",
        severity: "WARN",
        object: exposedName(view, "view_name"),
        message: "View in exposed schema is not marked security_invoker.",
        remediation: "On Postgres 15+, use CREATE VIEW ... WITH (security_invoker = true), or keep the view unexposed."
      });
    }
  }

  return findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

export function hasHighSeverity(findings) {
  return findings.some((finding) => finding.severity === "HIGH");
}

function severityRank(severity) {
  return { HIGH: 0, MEDIUM: 1, WARN: 2 }[severity] ?? 3;
}
