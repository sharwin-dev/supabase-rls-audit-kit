#!/usr/bin/env node
import { loadCatalog } from "./db.js";
import { evaluateCatalog, hasHighSeverity } from "./checks/evaluate.js";
import { formatFindings } from "./output.js";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

try {
  const catalog = await loadCatalog({
    databaseUrl: args.databaseUrl ?? process.env.DATABASE_URL,
    exposedSchemas: args.schemas
  });
  const findings = evaluateCatalog(catalog);
  console.log(formatFindings(findings, args.format));
  process.exit(hasHighSeverity(findings) ? 2 : 0);
} catch (error) {
  console.error(`rls-audit failed: ${error.message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = {
    format: "text",
    schemas: undefined,
    databaseUrl: undefined,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--database-url") {
      parsed.databaseUrl = argv[++index];
    } else if (arg === "--format") {
      parsed.format = argv[++index];
    } else if (arg === "--schemas") {
      parsed.schemas = argv[++index]?.split(",").map((item) => item.trim()).filter(Boolean);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["text", "json"].includes(parsed.format)) {
    throw new Error("--format must be text or json");
  }

  return parsed;
}

function printHelp() {
  console.log(`rls-audit

Usage:
  rls-audit --database-url "$DATABASE_URL" [--format text|json] [--schemas public,storage]

Environment:
  DATABASE_URL may be used instead of --database-url.
`);
}
