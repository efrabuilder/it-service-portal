// pages/dashboard.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

const STATUS_LABELS   = { open: "Open", in_progress: "In Progress", closed: "Closed" };
const PRIORITY_LABELS = { high: "High", medium: "Medium", low: "Low" };
const CATEGORY_LABELS = { network: "Network", software: "Software", hardware: "Hardware", access: "Access", server: "Server", general: "General" };

function Badge({ value, type }) {
  return <span className={`badge-${value}`}>{type === "status" ? STATUS_LABELS[value] : PRIORITY_LABELS[value]}</span>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [tickets, setTickets]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [filters, setFilters]   = useState({ status: "all", priority: "all", category: "all", search: "" });
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium", category: "general" });

  // Auth check on mount
  useEffect(() => {
    fetch("/api/users")
      .then(r => {
        if (r.status === 401) { router.replace("/"); return null; }
        return r.json();
      })
      .then(data => { if (data) setUsers(data); })
      .catch(() => router.replace("/"));
  }, []);

  const fetchTickets = useCallback(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== "all") params.set(k, v); });
    const res = await fetch("/api/tickets?" + params);
    if (res.status === 401) { router.replace("/"); return; }
    setTickets(await res.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function updateTicket(id, patch) {
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    fetchTickets();
    if (selected?.id === id) setSelected(t => ({ ...t, ...patch }));
  }

  async function createTicket(e) {
    e.preventDefault();
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket),
    });
    if (res.ok) {
      setShowNew(false);
      setNewTicket({ title: "", description: "", priority: "medium", category: "general" });
      fetchTickets();
    }
  }

  const stats = {
    open:        tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    closed:      tickets.filter(t => t.status === "closed").length,
    high:        tickets.filter(t => t.priority === "high").length,
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur border-b border-white/8 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-lg tracking-tight">efra<span className="text-[#FF6B35]">.</span>portal</span>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNew(true)}
            className="bg-[#FF6B35] hover:bg-[#ff4d1a] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition">
            + New Ticket
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-white transition">Logout</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-56 border-r border-white/8 p-4 flex flex-col gap-1 shrink-0">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">Filters</p>
          {[
            { label: "Status",   key: "status",   opts: ["all","open","in_progress","closed"] },
            { label: "Priority", key: "priority", opts: ["all","high","medium","low"] },
            { label: "Category", key: "category", opts: ["all","network","software","hardware","access","server","general"] },
          ].map(f => (
            <div key={f.key} className="mb-3">
              <p className="text-xs text-gray-500 mb-1">{f.label}</p>
              <select
                value={filters[f.key]}
                onChange={e => setFilters(p => ({...p, [f.key]: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#FF6B35]"
              >
                {f.opts.map(o => <option key={o} value={o}>{o === "all" ? "All" : o === "in_progress" ? "In Progress" : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
          ))}

          {/* Stats */}
          <div className="mt-auto pt-4 border-t border-white/8 space-y-2">
            {[
              { label: "Open",        val: stats.open,        color: "text-blue-400" },
              { label: "In Progress", val: stats.in_progress, color: "text-yellow-400" },
              { label: "Closed",      val: stats.closed,      color: "text-green-400" },
              { label: "High prio",   val: stats.high,        color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{s.label}</span>
                <span className={`font-bold ${s.color}`}>{s.val}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-auto p-6">
          {/* Search */}
          <input
            type="text" placeholder="Search tickets..."
            value={filters.search}
            onChange={e => setFilters(p => ({...p, search: e.target.value}))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white mb-4 focus:outline-none focus:border-[#FF6B35]"
          />

          {loading ? (
            <div className="text-center text-gray-500 py-20">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center text-gray-500 py-20">No tickets found.</div>
          ) : (
            <div className="space-y-2">
              {tickets.map(t => (
                <div key={t.id}
                  onClick={() => setSelected(t)}
                  className="bg-[#141414] border border-white/8 hover:border-white/15 rounded-xl p-4 cursor-pointer transition flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">#{t.id}</span>
                      <Badge value={t.status} type="status" />
                      <Badge value={t.priority} type="priority" />
                      <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded">{t.category}</span>
                    </div>
                    <p className="font-semibold text-sm text-white truncate">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-600">{t.assignee_name || "Unassigned"}</p>
                    <p className="text-xs text-gray-700 mt-0.5">{t.created_at?.slice(0, 10)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* TICKET DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#141414] border border-white/12 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Ticket #{selected.id}</p>
                <h2 className="text-lg font-bold">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-white text-xl leading-none">✕</button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selected.description}</p>
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge value={selected.status} type="status" />
              <Badge value={selected.priority} type="priority" />
              <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded">{selected.category}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Status */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Status</label>
                <select
                  value={selected.status}
                  onChange={e => { setSelected(s => ({...s, status: e.target.value})); updateTicket(selected.id, { status: e.target.value }); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {/* Assign */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Assign to</label>
                <select
                  value={selected.assigned_to || ""}
                  onChange={e => { setSelected(s => ({...s, assigned_to: e.target.value})); updateTicket(selected.id, { assigned_to: e.target.value || null }); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="text-xs text-gray-600 border-t border-white/8 pt-3 flex justify-between">
              <span>Created by {selected.creator_name}</span>
              <span>{selected.created_at?.slice(0, 16)}</span>
            </div>
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-[#141414] border border-white/12 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">New Ticket</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={createTicket} className="space-y-3">
              <input required placeholder="Title" value={newTicket.title}
                onChange={e => setNewTicket(p => ({...p, title: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35]" />
              <textarea required rows={3} placeholder="Description" value={newTicket.description}
                onChange={e => setNewTicket(p => ({...p, description: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B35] resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newTicket.priority} onChange={e => setNewTicket(p => ({...p, priority: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select value={newTicket.category} onChange={e => setNewTicket(p => ({...p, category: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  {Object.keys(CATEGORY_LABELS).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#ff4d1a] text-white font-semibold py-2 rounded-lg transition">
                Create Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
