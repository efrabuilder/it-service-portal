// scripts/initDb.js — force a fresh database with sample data
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../data/portal.db");

for (const suffix of ["", "-wal", "-shm"]) {
  const p = DB_PATH + suffix;
  if (fs.existsSync(p)) fs.rmSync(p);
}
console.log("🗑️  Base de datos anterior eliminada (si existía).");

// Importar lib/db.js dispara la creación del esquema y el seed automático
await import("../lib/db.js");

console.log("✅ Base de datos inicializada con datos de ejemplo.");
console.log("👤 Admin: admin@portal.com / admin123");
console.log("👤 User:  john@portal.com  / user123");
