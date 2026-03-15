// lib/db.js — in-memory SQLite for Vercel compatibility
import initSqlJs from "sql.js";
import bcrypt from "bcryptjs";

let db = null;

async function initDb(SQL) {
  const database = new SQL.Database();
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'general',
      created_by INTEGER, assigned_to INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const users = [
    { name: "Admin User", email: "admin@portal.com", password: "admin123", role: "admin" },
    { name: "John Tech",  email: "john@portal.com",  password: "user123",  role: "user"  },
    { name: "Maria Ops",  email: "maria@portal.com", password: "user123",  role: "user"  },
  ];
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 8);
    database.run("INSERT OR IGNORE INTO users(name,email,password,role) VALUES(?,?,?,?)",
      [u.name, u.email, hash, u.role]);
  }

  const tickets = [
    ["VPN not connecting",       "Users cannot connect to VPN.",              "open",        "high",   "network",  2, 1],
    ["Outlook crashes on start", "MS Outlook crashes on 3 workstations.",     "in_progress", "high",   "software", 3, 1],
    ["New laptop setup",         "Setup laptop for new hire.",                "open",        "medium", "hardware", 2, null],
    ["Printer offline Floor2",   "HP LaserJet on 2nd floor shows offline.",   "open",        "low",    "hardware", 3, null],
    ["Password reset request",   "User locked out of AD account.",            "closed",      "medium", "access",   2, 1],
    ["Slow internet Sales",      "Sales team reports internet speed dropped.", "in_progress", "high",   "network",  3, 1],
    ["Install Adobe Acrobat",    "Legal dept needs Adobe Acrobat Pro.",       "open",        "low",    "software", 2, null],
    ["Server disk space alert",  "Zabbix: /var partition at 91%.",            "open",        "high",   "server",   1, 1],
  ];
  for (const t of tickets) {
    database.run(`INSERT INTO tickets(title,description,status,priority,category,created_by,assigned_to)
                  VALUES(?,?,?,?,?,?,?)`, t);
  }
  return database;
}

export async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  db = await initDb(SQL);
  return db;
}

export function query(database, sql, params = []) {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function run(database, sql, params = []) {
  database.run(sql, params);
}
