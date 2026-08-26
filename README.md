# 🎫 IT Service Portal

Full-stack IT ticket management system built with Next.js, React and SQLite. Features role-based access, ticket creation, status tracking, assignment and filtering.

Built by **Efraín Rojas Artavia**

---

## Features

- ✅ **Login** with role-based access (Admin / User)
- ✅ **Create tickets** with title, description, priority and category
- ✅ **List & filter** tickets by status, priority, category or search
- ✅ **Change status** — Open / In Progress / Closed
- ✅ **Assign tickets** to team members
- ✅ **Stats sidebar** — live counts per status and priority
- ✅ **SQLite database** — no external DB server needed

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Next.js 16 |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | SQLite (Node's built-in `node:sqlite`, requires Node.js 22.13+) |
| Auth | JWT + HTTP-only cookies |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/efrabuilder/it-service-portal.git
cd it-service-portal

# 2. Install
npm install

# 3. Set your JWT secret
cp .env.example .env.local
# edit .env.local and set JWT_SECRET to a long random string

# 4. Initialize database with sample data
npm run db:init

# 5. Run
npm run dev
```

Open http://localhost:3000

The database lives in `data/portal.db` and persists between restarts. It's created automatically on first run; `npm run db:init` wipes it and reseeds the sample data.

---

## Demo Credentials

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@portal.com    | admin123  |
| User  | john@portal.com     | user123   |

---

## Project Structure

```
it-service-portal/
├── pages/
│   ├── index.js          # Login page
│   ├── dashboard.js      # Main dashboard
│   └── api/
│       ├── auth/         # Login / Logout
│       ├── tickets/      # CRUD endpoints
│       └── users/        # Users list
├── lib/
│   ├── db.js             # SQLite connection
│   └── auth.js           # JWT helpers
├── scripts/
│   └── initDb.js         # DB seed script
├── styles/
│   └── globals.css
└── data/
    └── portal.db         # Auto-created on init
```

---

## License
MIT
