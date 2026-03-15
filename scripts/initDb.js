// scripts/initDb.js
const initSqlJs = require("sql.js");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/portal.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

initSqlJs().then(SQL => {
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'general',
      created_by INTEGER,
      assigned_to INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed users
  const users = [
    { name: "Admin User", email: "admin@portal.com", password: "admin123", role: "admin" },
    { name: "John Tech",  email: "john@portal.com",  password: "user123",  role: "user"  },
    { name: "Maria Ops",  email: "maria@portal.com", password: "user123",  role: "user"  },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    db.run("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?,?,?,?)",
      [u.name, u.email, hash, u.role]);
  }

  // Seed tickets
  const tickets = [
    ["VPN not connecting",       "Users in Alajuela cannot connect to VPN.",              "open",        "high",   "network",  2, 1],
    ["Outlook crashes on start", "MS Outlook crashes on 3 workstations after login.",      "in_progress", "high",   "software", 3, 1],
    ["New laptop setup",         "Setup laptop for new hire starting Monday.",             "open",        "medium", "hardware", 2, null],
    ["Printer offline Floor2",   "HP LaserJet on 2nd floor shows offline.",               "open",        "low",    "hardware", 3, null],
    ["Password reset request",   "User locked out of AD account after 5 attempts.",       "closed",      "medium", "access",   2, 1],
    ["Slow internet Sales",      "Sales team reports internet speed dropped.",             "in_progress", "high",   "network",  3, 1],
    ["Install Adobe Acrobat",    "Legal dept needs Adobe Acrobat Pro on 5 machines.",     "open",        "low",    "software", 2, null],
    ["Server disk space alert",  "Zabbix: /var partition at 91% on prod-server-01.",      "open",        "high",   "server",   1, 1],
  ];

  for (const t of tickets) {
    db.run(`INSERT INTO tickets (title,description,status,priority,category,created_by,assigned_to)
            VALUES (?,?,?,?,?,?,?)`, t);
  }

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();

  console.log("✅ Database initialized with sample data.");
  console.log("👤 Admin: admin@portal.com / admin123");
  console.log("👤 User:  john@portal.com  / user123");
});
