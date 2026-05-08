import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function runSQL(sql: string): Promise<{ error?: string }> {
  // Use the Supabase SQL API (available via pg-meta)
  const res = await fetch(`${supabaseUrl}/pg/query`, {
    method: "POST",
    headers: {
      "apikey": serviceRoleKey,
      "Authorization": `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: text };
  }

  return {};
}

async function migrate() {
  const sqlPath = join(process.cwd(), "supabase/migrations/0001_init.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("Running migration...");
  const { error } = await runSQL(sql);

  if (error) {
    console.error("Migration error:", error);
    console.log("\nTrying to run statements individually...");

    // Split into individual statements handling $$ blocks
    const statements: string[] = [];
    let current = "";
    let dollarCount = 0;

    for (const line of sql.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("--")) {
        if (dollarCount > 0) current += line + "\n";
        continue;
      }

      current += line + "\n";

      const matches = line.match(/\$\$/g);
      if (matches) {
        dollarCount += matches.length;
      }

      if (dollarCount % 2 === 0 && trimmed.endsWith(";")) {
        statements.push(current.trim());
        current = "";
      }
    }

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 80).replace(/\n/g, " ");
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      const { error: stmtError } = await runSQL(stmt);
      if (stmtError) {
        console.error(`  Error: ${stmtError.substring(0, 200)}`);
      } else {
        console.log(`  OK`);
      }
    }
  } else {
    console.log("Migration completed successfully!");
  }
}

migrate().catch(console.error);
