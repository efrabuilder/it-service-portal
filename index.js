import { getDb, query } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";

export default requireAuth(async function handler(req, res) {
  const db = await getDb();
  res.json(query(db, "SELECT id, name, email, role FROM users ORDER BY name"));
});
