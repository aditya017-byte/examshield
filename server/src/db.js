import pg from "pg";

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is missing. Configure server/.env before starting the API.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined
});
