import { CATALOG_SQL, DEFAULT_EXPOSED_SCHEMAS } from "./checks/catalog-sql.js";

export async function loadCatalog({ databaseUrl, exposedSchemas = DEFAULT_EXPOSED_SCHEMAS }) {
  if (!databaseUrl) {
    throw new Error("databaseUrl is required");
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    const result = await client.query(CATALOG_SQL, [exposedSchemas]);
    return result.rows[0]?.audit_catalog ?? emptyCatalog();
  } finally {
    await client.end();
  }
}

export function emptyCatalog() {
  return {
    tables: [],
    grants: [],
    functions: [],
    views: [],
    storage_policies: []
  };
}
