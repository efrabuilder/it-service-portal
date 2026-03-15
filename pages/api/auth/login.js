// pages/api/auth/login.js
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { getDb, query } from "../../../lib/db";
import { signToken } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  const db = await getDb();
  const users = query(db, "SELECT * FROM users WHERE email = ?", [email]);
  const user = users[0];
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.setHeader("Set-Cookie", serialize("token", token, {
    httpOnly: true, path: "/", maxAge: 60 * 60 * 8, sameSite: "lax"
  }));
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
