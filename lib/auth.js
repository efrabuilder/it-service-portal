// lib/auth.js
import jwt from "jsonwebtoken";
import { parse } from "cookie";

function resolveSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET no está definido. Configúralo en tus variables de entorno antes de arrancar en producción."
    );
  }
  console.warn(
    "⚠️  JWT_SECRET no está definido — usando un secreto temporal solo para desarrollo local. " +
    "Define JWT_SECRET en .env.local antes de desplegar."
  );
  return "dev-only-insecure-secret-" + Math.random().toString(36).slice(2);
}

const SECRET = resolveSecret();

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
