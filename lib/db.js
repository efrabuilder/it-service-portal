// lib/db.js — simple in-memory store, no sql.js needed
import bcrypt from "bcryptjs";

// ── In-memory store ────────────────────────────────────────────────────────────
const store = {
  users: [
    { id: 1, name: "Admin User", email: "admin@portal.com", password: bcrypt.hashSync("admin123", 8), role: "admin", created_at: "2026-01-01 00:00:00" },
    { id: 2, name: "John Tech",  email: "john@portal.com",  password: bcrypt.hashSync("user123",  8), role: "user",  created_at: "2026-01-01 00:00:00" },
    { id: 3, name: "Maria Ops",  email: "maria@portal.com", password: bcrypt.hashSync("user123",  8), role: "user",  created_at: "2026-01-01 00:00:00" },
  ],
  tickets: [
    { id: 1, title: "VPN not connecting",       description: "Users cannot connect to VPN.",              status: "open",        priority: "high",   category: "network",  created_by: 2, assigned_to: 1, created_at: "2026-03-01 08:00:00", updated_at: "2026-03-01 08:00:00" },
    { id: 2, title: "Outlook crashes on start", description: "MS Outlook crashes on 3 workstations.",     status: "in_progress", priority: "high",   category: "software", created_by: 3, assigned_to: 1, created_at: "2026-03-02 09:00:00", updated_at: "2026-03-02 09:00:00" },
    { id: 3, title: "New laptop setup",         description: "Setup laptop for new hire.",                status: "open",        priority: "medium", category: "hardware", created_by: 2, assigned_to: null, created_at: "2026-03-03 10:00:00", updated_at: "2026-03-03 10:00:00" },
    { id: 4, title: "Printer offline Floor2",   description: "HP LaserJet on 2nd floor shows offline.",   status: "open",        priority: "low",    category: "hardware", created_by: 3, assigned_to: null, created_at: "2026-03-04 11:00:00", updated_at: "2026-03-04 11:00:00" },
    { id: 5, title: "Password reset request",   description: "User locked out of AD account.",            status: "closed",      priority: "medium", category: "access",   created_by: 2, assigned_to: 1,    created_at: "2026-03-05 12:00:00", updated_at: "2026-03-05 12:00:00" },
    { id: 6, title: "Slow internet Sales",      description: "Sales team reports internet speed dropped.", status: "in_progress", priority: "high",   category: "network",  created_by: 3, assigned_to: 1,    created_at: "2026-03-06 13:00:00", updated_at: "2026-03-06 13:00:00" },
    { id: 7, title: "Install Adobe Acrobat",    description: "Legal dept needs Adobe Acrobat Pro.",       status: "open",        priority: "low",    category: "software", created_by: 2, assigned_to: null, created_at: "2026-03-07 14:00:00", updated_at: "2026-03-07 14:00:00" },
    { id: 8, title: "Server disk space alert",  description: "Zabbix: /var partition at 91%.",            status: "open",        priority: "high",   category: "server",   created_by: 1, assigned_to: 1,    created_at: "2026-03-08 15:00:00", updated_at: "2026-03-08 15:00:00" },
  ],
  nextTicketId: 9,
};

// ── User helpers ───────────────────────────────────────────────────────────────
export function findUserByEmail(email) {
  return store.users.find(u => u.email === email) || null;
}

export function getAllUsers() {
  return store.users.map(({ password, ...u }) => u);
}

// ── Ticket helpers ─────────────────────────────────────────────────────────────
function attachNames(ticket) {
  const creator  = store.users.find(u => u.id === ticket.created_by);
  const assignee = store.users.find(u => u.id === ticket.assigned_to);
  return {
    ...ticket,
    creator_name:  creator  ? creator.name  : null,
    assignee_name: assignee ? assignee.name : null,
  };
}

export function getTickets({ status, priority, category, search } = {}) {
  let list = [...store.tickets];
  if (status   && status   !== "all") list = list.filter(t => t.status   === status);
  if (priority && priority !== "all") list = list.filter(t => t.priority === priority);
  if (category && category !== "all") list = list.filter(t => t.category === category);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(attachNames);
}

export function getTicketById(id) {
  const t = store.tickets.find(t => t.id === Number(id));
  return t ? attachNames(t) : null;
}

export function createTicket({ title, description, priority, category, created_by }) {
  const ticket = {
    id: store.nextTicketId++,
    title, description,
    status: "open",
    priority: priority || "medium",
    category: category || "general",
    created_by, assigned_to: null,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  store.tickets.push(ticket);
  return ticket;
}

export function updateTicket(id, patch) {
  const idx = store.tickets.findIndex(t => t.id === Number(id));
  if (idx === -1) return false;
  store.tickets[idx] = {
    ...store.tickets[idx],
    ...patch,
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  return true;
}

export function deleteTicket(id) {
  const idx = store.tickets.findIndex(t => t.id === Number(id));
  if (idx === -1) return false;
  store.tickets.splice(idx, 1);
  return true;
}
