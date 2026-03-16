// pages/index.js — Login
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError("Invalid email or password"); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-black tracking-tight">efra<span className="text-[#FF6B35]">.</span>portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">IT Service Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your tickets</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B35] transition"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B35] transition"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#FF6B35] hover:bg-[#ff4d1a] text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-white/8">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Demo credentials</p>
            <div className="space-y-2">
              {[
                { role: "Admin", email: "admin@portal.com", pw: "admin123" },
                { role: "User",  email: "john@portal.com",  pw: "user123"  },
              ].map(c => (
                <button key={c.role}
                  onClick={() => setForm({ email: c.email, password: c.pw })}
                  className="w-full text-left bg-white/3 hover:bg-white/6 border border-white/8 rounded-lg px-3 py-2 transition"
                >
                  <span className="text-xs font-semibold text-[#FF6B35]">{c.role}</span>
                  <span className="text-xs text-gray-400 ml-2">{c.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
