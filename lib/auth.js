// lib/auth.js
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const SECRET = process.env.JWT_SECRET || "it-portal-secret-2026";

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); }
  catch { return null; }
}

export function getUser(req) {
  const cookies = parse(req.headers.cookie || "");
  if (!cookies.token) return null;
  return verifyToken(cookies.token);
}

export function requireAuth(handler) {
  return (req, res) => {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    return handler(req, res);
  };
}

export function requireAdmin(handler) {
  return (req, res) => {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    return handler(req, res);
  };
}
