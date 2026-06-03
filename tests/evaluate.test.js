import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateCatalog, hasHighSeverity } from "../src/checks/evaluate.js";
import { formatFindings } from "../src/output.js";

test("flags tables in exposed schemas with RLS disabled", () => {
  const findings = evaluateCatalog({
    tables: [{ schema_name: "public", table_name: "clients", rls_enabled: false, policy_count: 0 }],
    grants: [],
    functions: [],
    views: []
  });

  assert.equal(findings[0].id, "table-rls-disabled");
  assert.equal(findings[0].severity, "HIGH");
  assert.equal(hasHighSeverity(findings), true);
});

test("flags RLS-enabled tables with no policies", () => {
  const findings = evaluateCatalog({
    tables: [{ schema_name: "public", table_name: "orders", rls_enabled: true, policy_count: 0 }],
    grants: [],
    functions: [],
    views: []
  });

  assert.deepEqual(findings.map((finding) => finding.id), ["table-no-policies"]);
});

test("flags unsafe user metadata policies", () => {
  const findings = evaluateCatalog({
    tables: [{
      schema_name: "public",
      table_name: "profiles",
      rls_enabled: true,
      policy_count: 1,
      references_user_metadata: true
    }],
    grants: [],
    functions: [],
    views: []
  });

  assert.equal(findings[0].id, "policy-user-metadata");
  assert.equal(findings[0].severity, "HIGH");
});

test("flags grants and exposed security definer functions", () => {
  const findings = evaluateCatalog({
    tables: [],
    grants: [{ schema_name: "public", table_name: "clients", grantee: "anon", privileges: "SELECT" }],
    functions: [{
      schema_name: "public",
      function_name: "delete_client",
      security_definer: true,
      anon_execute: false,
      authenticated_execute: true
    }],
    views: []
  });

  assert.deepEqual(findings.map((finding) => finding.id), [
    "role-table-grant",
    "security-definer-exposed-schema",
    "function-executable-by-client-role"
  ]);
});

test("flags non-security-invoker views", () => {
  const findings = evaluateCatalog({
    tables: [],
    grants: [],
    functions: [],
    views: [{ schema_name: "public", view_name: "client_names", security_invoker: false }]
  });

  assert.equal(findings[0].id, "view-not-security-invoker");
  assert.equal(findings[0].severity, "WARN");
});

test("formats text and json output", () => {
  const findings = [{
    id: "table-rls-disabled",
    severity: "HIGH",
    object: "public.clients",
    message: "Table is in an exposed schema but RLS is disabled.",
    remediation: "Enable RLS."
  }];

  assert.match(formatFindings(findings, "text"), /HIGH: public\.clients/);
  assert.deepEqual(JSON.parse(formatFindings(findings, "json")).findings, findings);
});

test("json output matches documented finding fields", () => {
  const schema = JSON.parse(readFileSync(new URL("../schemas/finding.schema.json", import.meta.url), "utf8"));
  const findings = evaluateCatalog({
    tables: [{ schema_name: "public", table_name: "clients", rls_enabled: false, policy_count: 0 }],
    grants: [],
    functions: [],
    views: []
  });
  const output = JSON.parse(formatFindings(findings, "json"));

  assert.deepEqual(Object.keys(output), ["findings"]);
  assert.equal(schema.required.includes("findings"), true);

  for (const finding of output.findings) {
    assert.deepEqual(Object.keys(finding), ["id", "severity", "object", "message", "remediation"]);
    assert.equal(schema.properties.findings.items.required.every((field) => field in finding), true);
    assert.equal(schema.properties.findings.items.properties.severity.enum.includes(finding.severity), true);
  }
});
