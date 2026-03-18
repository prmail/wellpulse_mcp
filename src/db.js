import pg from "pg";

const { Pool } = pg;

/**
 * Shared PostgreSQL connection pool.
 * All connection params are read from environment variables — see .env.example.
 */
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Match the PHP app's search_path
pool.on("connect", (client) => {
  client.query("SET search_path TO pulse, public");
});

export default pool;
