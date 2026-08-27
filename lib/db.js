// lib/db.js — SQLite persistence via Node's built-in node:sqlite (no native build step)
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Vercel's deployment filesystem is read-only in production — only /tmp is writable there.
// Locally (and on most other hosts) we use a real data/ folder that persists on disk.
const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "portal.db")
  : path.join(process.cwd(), "data", "portal.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
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

// ── Seed on first run only (table empty) ────────────────────────────────────
const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
if (userCount === 0) {
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)"
  );
  const seedUsers = [
    ["Admin User", "admin@portal.com", "admin123", "admin"],
    ["John Tech", "john@portal.com", "user123", "user"],
    ["Maria Ops", "maria@portal.com", "user123", "user"],
  ];
  for (const [name, email, pw, role] of seedUsers) {
    insertUser.run(name, email, bcrypt.hashSync(pw, 10), role);
  }

  const insertTicket = db.prepare(`
    INSERT INTO tickets (title, description, status, priority, category, created_by, assigned_to)
    VALUES (?,?,?,?,?,?,?)
  `);
  const seedTickets = [
    ["VPN not connecting", "Users cannot connect to VPN.", "open", "high", "network", 2, 1],
    ["Outlook crashes on start", "MS Outlook crashes on 3 workstations.", "in_progress", "high", "software", 3, 1],
    ["New laptop setup", "Setup laptop for new hire.", "open", "medium", "hardware", 2, null],
    ["Printer offline Floor2", "HP LaserJet on 2nd floor shows offline.", "open", "low", "hardware", 3, null],
    ["Password reset request", "User locked out of AD account.", "closed", "medium", "access", 2, 1],
    ["Slow internet Sales", "Sales team reports internet speed dropped.", "in_progress", "high", "network", 3, 1],
    ["Install Adobe Acrobat", "Legal dept needs Adobe Acrobat Pro.", "open", "low", "software", 2, null],
    ["Server disk space alert", "Zabbix: /var partition at 91%.", "open", "high", "server", 1, 1],
  ];
  for (const t of seedTickets) insertTicket.run(...t);
}

// ── Allowed values (server-side validation) ─────────────────────────────────
const VALID_STATUS = ["open", "in_progress", "closed"];
const VALID_PRIORITY = ["low", "medium", "high"];
const VALID_CATEGORY = ["network", "software", "hardware", "access", "server", "general"];

// ── User helpers ─────────────────────────────────────────────────────────────
export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) || null;
}

export function getUserById(id) {
  if (!id) return null;
  return db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id) || null;
}

export function getAllUsers() {
  return db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY name").all();
}

// ── Ticket helpers ───────────────────────────────────────────────────────────
function attachNames(ticket) {
  const creator = getUserById(ticket.created_by);
  const assignee = getUserById(ticket.assigned_to);
  return {
    ...ticket,
    creator_name: creator ? creator.name : null,
    assignee_name: assignee ? assignee.name : null,
  };
}

export function getTickets({ status, priority, category, search } = {}) {
  const clauses = [];
  const params = [];
  if (status && status !== "all") { clauses.push("status = ?"); params.push(status); }
  if (priority && priority !== "all") { clauses.push("priority = ?"); params.push(priority); }
  if (category && category !== "all") { clauses.push("category = ?"); params.push(category); }
  if (search) {
    clauses.push("(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)");
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT * FROM tickets ${where} ORDER BY created_at DESC`).all(...params);
  return rows.map(attachNames);
}

export function getTicketById(id) {
  const t = db.prepare("SELECT * FROM tickets WHERE id = ?").get(Number(id));
  return t ? attachNames(t) : null;
}

export function createTicket({ title, description, priority, category, created_by }) {
  const safePriority = VALID_PRIORITY.includes(priority) ? priority : "medium";
  const safeCategory = VALID_CATEGORY.includes(category) ? category : "general";
  const result = db.prepare(`
    INSERT INTO tickets (title, description, status, priority, category, created_by, assigned_to)
    VALUES (?, ?, 'open', ?, ?, ?, NULL)
  `).run(title, description, safePriority, safeCategory, created_by);
  return getTicketById(result.lastInsertRowid);
}

export function updateTicket(id, patch) {
  const fields = [];
  const params = [];
  if (patch.status !== undefined && VALID_STATUS.includes(patch.status)) {
    fields.push("status = ?"); params.push(patch.status);
  }
  if (patch.priority !== undefined && VALID_PRIORITY.includes(patch.priority)) {
    fields.push("priority = ?"); params.push(patch.priority);
  }
  if (patch.assigned_to !== undefined) {
    fields.push("assigned_to = ?"); params.push(patch.assigned_to);
  }
  if (fields.length === 0) return false;
  fields.push("updated_at = datetime('now')");
  params.push(Number(id));
  const result = db.prepare(`UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return result.changes > 0;
}

export function deleteTicket(id) {
  const result = db.prepare("DELETE FROM tickets WHERE id = ?").run(Number(id));
  return result.changes > 0;
}
