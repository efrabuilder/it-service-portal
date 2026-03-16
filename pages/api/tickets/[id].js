// pages/api/tickets/[id].js
import { getTicketById, updateTicket, deleteTicket } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";

export default requireAuth(function handler(req, res) {
  const { id } = req.query;
  if (req.method === "GET") {
    const ticket = getTicketById(id);
    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  }
  if (req.method === "PATCH") {
    const { status, assigned_to, priority } = req.body;
    const patch = {};
    if (status !== undefined)      patch.status = status;
    if (assigned_to !== undefined) patch.assigned_to = assigned_to ? Number(assigned_to) : null;
    if (priority !== undefined)    patch.priority = priority;
    updateTicket(id, patch);
    return res.json({ ok: true });
  }
  if (req.method === "DELETE") {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    deleteTicket(id);
    return res.json({ ok: true });
  }
  res.status(405).end();
});
