// pages/api/auth/logout.js
import { serialize } from "cookie";
export default function handler(req, res) {
  res.setHeader("Set-Cookie", serialize("token", "", { path: "/", maxAge: 0 }));
  res.json({ ok: true });
}
