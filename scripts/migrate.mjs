import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const migrationsDir = path.join(process.cwd(), "database", "migrations");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function connectWithRetry(url, attempts = 10) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await mysql.createConnection(url);
    } catch (error) {
      const refused =
        error?.code === "ECONNREFUSED" || error?.errno === -4078;
      if (!refused || i === attempts) {
        throw error;
      }
      console.log(
        `Database nog niet bereikbaar (poging ${i}/${attempts}), wacht 2s…`,
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Could not connect to database");
}

async function main() {
  loadEnvFile();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Zet het in .env (zie .env.example).",
    );
    process.exit(1);
  }

  const connection = await connectWithRetry(url);
  const files = (await fsPromises.readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await fsPromises.readFile(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    for (const statement of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
      await connection.query(statement);
    }
  }

  await connection.end();
  console.log("Migrations complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
