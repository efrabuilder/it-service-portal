// pages/api/tickets/index.js
import { getTickets, createTicket } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";

export default requireAuth(function handler(req, res) {
  if (req.method === "GET") {
    return res.json(getTickets(req.query));
  }
  if (req.method === "POST") {
    const { title, description, priority, category } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });
    const ticket = createTicket({ title, description, priority, category, created_by: req.user.id });
    return res.status(201).json(ticket);
  }
  res.status(405).end();
});
