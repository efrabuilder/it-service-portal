// pages/api/tickets/[id].js
import { getDb, query, run } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";

export default requireAuth(async function handler(req, res) {
  const db = await getDb();
  const { id } = req.query;

  if (req.method === "GET") {
    const rows = query(db, `
      SELECT t.*, u1.name AS creator_name, u2.name AS assignee_name
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by  = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    return res.json(rows[0]);
  }

  if (req.method === "PATCH") {
    const { status, assigned_to, priority } = req.body;
    const fields = [];
    const params = [];
    if (status)                    { fields.push("status = ?");      params.push(status);      }
    if (assigned_to !== undefined) { fields.push("assigned_to = ?"); params.push(assigned_to); }
    if (priority)                  { fields.push("priority = ?");    params.push(priority);    }
    if (!fields.length) return res.status(400).json({ error: "Nothing to update" });
    fields.push("updated_at = datetime('now')");
    params.push(id);
    run(db, `UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`, params);
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    run(db, "DELETE FROM tickets WHERE id = ?", [id]);
    return res.json({ ok: true });
  }

  res.status(405).end();
});
