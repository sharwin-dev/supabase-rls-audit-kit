import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const fixtureUrl = (file) => new URL(`../examples/fixtures/tenant-isolation/${file}`, import.meta.url);
const readFixture = (file) => readFileSync(fixtureUrl(file), "utf8");

test("tenant-isolation fixture manifest covers every intended case", () => {
  const manifest = JSON.parse(readFixture("manifest.json"));

  assert.deepEqual(manifest.fixtures.map((fixture) => fixture.file), [
    "good-owner-isolation.sql",
    "bad-cross-tenant-select.sql",
    "bad-unscoped-insert.sql",
    "bad-user-metadata-tenant.sql"
  ]);
  assert.deepEqual(manifest.fixtures.map((fixture) => fixture.classification), [
    "good",
    "bad",
    "bad",
    "bad"
  ]);
});

test("good tenant fixture scopes reads and writes to auth.uid", () => {
  const sql = readFixture("good-owner-isolation.sql");

  assert.match(sql, /enable row level security/i);
  assert.match(sql, /for select[\s\S]*using \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.match(sql, /for insert[\s\S]*with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.match(sql, /for update[\s\S]*using \(\(select auth\.uid\(\)\) = owner_id\)[\s\S]*with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.match(sql, /for delete[\s\S]*using \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.doesNotMatch(sql, /user_metadata|raw_user_meta_data/i);
});

test("bad tenant fixtures preserve their documented unsafe patterns", () => {
  assert.match(readFixture("bad-cross-tenant-select.sql"), /for select[\s\S]*using \(true\)/i);
  assert.match(readFixture("bad-unscoped-insert.sql"), /for insert[\s\S]*with check \(true\)/i);
  assert.match(readFixture("bad-user-metadata-tenant.sql"), /user_metadata/i);
});
