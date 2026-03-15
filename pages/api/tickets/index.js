import { getDb, query, run } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";

export default requireAuth(async function handler(req, res) {
  const db = await getDb();
  if (req.method === "GET") {
    const { status, priority, category, search } = req.query;
    let sql = `SELECT t.*, u1.name AS creator_name, u2.name AS assignee_name
      FROM tickets t LEFT JOIN users u1 ON t.created_by=u1.id
      LEFT JOIN users u2 ON t.assigned_to=u2.id WHERE 1=1`;
    const params = [];
    if (status && status !== "all") { sql += " AND t.status=?"; params.push(status); }
    if (priority && priority !== "all") { sql += " AND t.priority=?"; params.push(priority); }
    if (category && category !== "all") { sql += " AND t.category=?"; params.push(category); }
    if (search) { sql += " AND (t.title LIKE ? OR t.description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    sql += " ORDER BY t.created_at DESC";
    return res.json(query(db, sql, params));
  }
  if (req.method === "POST") {
    const { title, description, priority = "medium", category = "general" } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });
    run(db, "INSERT INTO tickets(title,description,priority,category,created_by) VALUES(?,?,?,?,?)",
      [title, description, priority, category, req.user.id]);
    return res.status(201).json({ ok: true });
  }
  res.status(405).end();
});
