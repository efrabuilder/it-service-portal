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
| Frontend | React 18 + Next.js 14 |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + HTTP-only cookies |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/efrabuilder/it-service-portal.git
cd it-service-portal

# 2. Install
npm install

# 3. Initialize database with sample data
npm run db:init

# 4. Run
npm run dev
```

Open http://localhost:3000

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
