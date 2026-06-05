import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("github actions docs include the workflow example and secret guidance", () => {
  const docs = readFileSync(new URL("../docs/github-actions.md", import.meta.url), "utf8");
  const workflow = readFileSync(new URL("../examples/github-action/rls-audit.yml", import.meta.url), "utf8");

  assert.match(docs, /examples\/github-action\/rls-audit\.yml/);
  assert.match(docs, /SUPABASE_DATABASE_URL/);
  assert.match(docs, /Do not hardcode database URLs/);

  assert.match(workflow, /secrets\.SUPABASE_DATABASE_URL/);
  assert.match(workflow, /npx rls-audit/);
  assert.match(workflow, /permissions:\n\s+contents: read/);
});

test("supabase cli local docs include default local database flow", () => {
  const docs = readFileSync(new URL("../docs/supabase-cli-local.md", import.meta.url), "utf8");
  const example = readFileSync(new URL("../examples/supabase-local/README.md", import.meta.url), "utf8");

  assert.match(docs, /supabase start/);
  assert.match(docs, /supabase db reset/);
  assert.match(docs, /127\.0\.0\.1:54322\/postgres/);
  assert.match(docs, /do not copy production database URLs/i);

  assert.match(example, /supabase status/);
  assert.match(example, /rls-audit/);
});
