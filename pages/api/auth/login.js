// pages/api/auth/login.js
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { findUserByEmail } from "../../../lib/db";
import { signToken } from "../../../lib/auth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.setHeader("Set-Cookie", serialize("token", token, {
    httpOnly: true, path: "/", maxAge: 60 * 60 * 8, sameSite: "lax"
  }));
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
