<div align="center">

# 🎓 Student Course Hub

**A server-rendered university course catalogue with an admin CMS — built on Deno with zero frontend framework.**

[![CI](https://github.com/igor-vuta/student-course-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/igor-vuta/student-course-hub/actions/workflows/ci.yml)

*Deno · Oak · SQLite · TypeScript · server-side rendering*

</div>

---

## ✨ What it does

Prospective students browse programmes and their module breakdowns, and register interest in a programme. Staff sign in to a role-gated admin area to manage the catalogue and export the interest mailing list.

- 📚 **Public catalogue** — programmes by level, module lists per year, staff per programme
- 📝 **Interest registration** — visitors leave name + email against a programme
- 🔐 **Admin CMS** — create/edit/publish programmes, edit modules, view and export registered interest as CSV
- 👥 **Two roles** — `admin` (everything) and `editor` (content only), enforced by middleware

## 🛡️ Security model

- Passwords hashed with **bcrypt**; server-side sessions in an 8-hour-TTL store with `crypto.randomUUID()` tokens
- **CSRF protection** — per-browser token, checked on every mutating request
- Role-based authorization middleware (`requireAuth`, `requireRole`)
- HTML escaping on all rendered data; parameterized SQL throughout

## 🚀 Quick start

```bash
deno task dev     # watch mode
deno task start   # production mode
```

First boot creates and seeds `student_hub.db` (8 programmes, 27 modules, demo accounts). No other setup.

| Demo account | Password | Role |
|---|---|---|
| `admin` | `admin123` | full access incl. mailing-list export |
| `editor` | `editor123` | content editing only |

Environment (all optional): `PORT` (default `8000`), `APP_ENV=production` enables secure cookies behind HTTPS.

## 🧱 How it's built

No frontend framework and no template engine — every page is a typed TypeScript function returning HTML, composed from small template helpers (`layout`, `nav`, `breadcrumbs`, `card`, `feedback`). Routing and middleware are [Oak](https://oakserver.github.io/oak/); storage is SQLite via `deno.land/x/sqlite`, schema-first with seed data in `src/db/init.ts`.

```
src/
├── main.ts            app wiring + static file serving
├── routes/            route table
├── controllers/       request handlers (auth, admin, programmes, editing)
├── middleware/        session, CSRF, authorization
├── models/            SQL access (users, programmes, interests)
├── views/ templates/  typed HTML rendering
└── db/                connection, schema + seeds
```

## 📦 Provenance

BSc Computer Science coursework project (final year), built solo — design, data model, security middleware and UI.

## 👤 Author

**Igor Vuta** — [github.com/igor-vuta](https://github.com/igor-vuta) · [portfolio](https://igor-vuta.github.io/portfolio/)
