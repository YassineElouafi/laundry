# Laundry App — Admin Dashboard Quickstarter (React + shadcn/ui)

A kickstart guide for the back-office / admin dashboard, designed to pair with your NestJS backend. Built for a **bespoke UI** with full **French + Arabic (RTL)** support. Feed this file to Claude Code to bootstrap efficiently.

---

## 1. Recommended Boilerplate

Use **`satnaing/shadcn-admin`** — the most popular shadcn admin template, actively maintained, Vite-based (clean fit for a separate NestJS API), and it already includes RTL direction support.

**Repo:** https://github.com/satnaing/shadcn-admin
**Stars:** ~12.4k · **Updated:** daily

### What it already ships (matches your stack almost exactly)
- ✅ **React 19 + Vite 8 + TypeScript** — fast, type-safe, same language as backend
- ✅ **shadcn/ui + Tailwind 4** — bespoke, fully customizable component layer (your choice)
- ✅ **TanStack Router** — type-safe routing
- ✅ **TanStack Query** — data fetching/caching against your REST API
- ✅ **TanStack Table** — the data grid for orders, customers, slots
- ✅ **React Hook Form + Zod** — forms & validation
- ✅ **Axios** — HTTP client (point it at your NestJS API)
- ✅ **Zustand** — lightweight client state
- ✅ **`@radix-ui/react-direction`** — **RTL support already wired in** (key for Arabic)
- ✅ Dark mode, command palette, responsive layout, sidebar nav

### Two things to change for your project
1. **Auth:** template uses **Clerk**. Rip it out and replace with your **NestJS JWT + refresh-token** flow (see §4).
2. **i18n:** template has direction support but no translation library. Add **i18next + react-i18next** for FR/AR strings (see §5).

### Clone & init
```bash
git clone --depth 1 https://github.com/satnaing/shadcn-admin.git laundry-dashboard
cd laundry-dashboard
rm -rf .git && git init
pnpm install        # or npm install
pnpm dev
```
Dashboard runs at `http://localhost:5173`.

---

## 2. Dashboard Scope (Admin Features)

Map these to the backend modules you already built.

| Screen | Backend module | What it does |
|---|---|---|
| **Dashboard / overview** | orders, payments | KPIs: today's orders, revenue, pending pickups, capacity used. Charts. |
| **Orders** | orders | Data table: filter by status, search, view detail, advance status (state machine), assign driver |
| **Order detail** | orders, order-items, order-events | Itemized lines, status timeline, customer + addresses, payment status |
| **Scheduling / capacity** | scheduling | Manage time slots, capacity per window, see bookings |
| **Catalog** | catalog | CRUD service categories & items, set per-kilo / per-item pricing (FR + AR names) |
| **Customers** | users, addresses | Lookup, order history, contact (WhatsApp link) |
| **Drivers** | users (role=driver) | Manage drivers, assignments |
| **Payments** | payments | COD reconciliation, CMI transaction list/status |
| **Reviews & damage reports** | reviews, damage-reports | Moderate reviews, handle damage claims (Phase 2) |
| **Settings** | — | Business hours, pricing rules, staff/roles |

---

## 3. Suggested Project Structure
```
src/
├── features/
│   ├── dashboard/        # overview + charts
│   ├── orders/           # table, detail, status actions
│   ├── scheduling/       # slots & capacity
│   ├── catalog/          # services & pricing CRUD
│   ├── customers/
│   ├── drivers/
│   ├── payments/
│   └── settings/
├── lib/
│   ├── api/              # axios instance + endpoint hooks (TanStack Query)
│   ├── auth/             # JWT/refresh, auth provider, route guards
│   └── i18n/             # i18next config, fr/ar resources, RTL toggle
├── components/ui/        # shadcn components
├── routes/               # TanStack Router route tree
└── stores/               # zustand (auth, ui prefs)
```

---

## 4. Replacing Clerk with NestJS Auth

Your boilerplate backend issues **JWT access + refresh tokens**. Wire the dashboard to it:

1. **Axios instance** (`lib/api/client.ts`) — base URL → NestJS API; attach `Authorization: Bearer <accessToken>` from store.
2. **Login flow** — POST `/auth/email/login` → store access + refresh tokens (in memory + refresh in httpOnly cookie ideally, or secure storage).
3. **Refresh interceptor** — on `401`, call `/auth/refresh`, retry the original request; on failure, redirect to login.
4. **Auth store** (Zustand) — holds user, role, tokens; `isAuthenticated` selector.
5. **Route guards** — TanStack Router `beforeLoad` checks auth + role (admin/staff only).
6. Remove all `@clerk/*` packages, `<ClerkProvider>`, and Clerk components/hooks.

> Prompt Claude Code: *"Remove Clerk from this shadcn-admin template and replace it with a JWT + refresh-token auth flow against a NestJS API: axios instance with auth header, refresh interceptor, Zustand auth store, login page hitting /auth/email/login, and TanStack Router route guards that require role=admin."*

---

## 5. French + Arabic (RTL)

The template already handles **direction** via `@radix-ui/react-direction`. Add translation + a language switch:

1. `pnpm add i18next react-i18next i18next-browser-languagedetector`
2. Create `lib/i18n/` with `fr.json` and `ar.json` resource files.
3. On language change: set `i18next` language **and** set document direction:
   ```ts
   document.documentElement.lang = lng;          // 'fr' | 'ar'
   document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
   ```
   Radix's `DirectionProvider` + Tailwind's logical properties (`ps-`, `pe-`, `ms-`, `me-`, `text-start`) then flip layout automatically.
4. Use Tailwind **logical** utilities (`ps-4` not `pl-4`) throughout so RTL just works.
5. Default language: **French** (staff), with an Arabic toggle in the top bar.

> Tip: keep catalog service names bilingual in the DB (you already planned i18n fields), and render the column matching the active UI language.

---

## 6. Supporting Library Choices (already in template unless noted)

| Concern | Library |
|---|---|
| Components | shadcn/ui (Radix + Tailwind) |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| Tables / data grid | TanStack Table |
| Forms + validation | React Hook Form + Zod |
| HTTP | Axios |
| Client state | Zustand |
| **Charts (add)** | **Recharts** or **Tremor** (`pnpm add recharts`) |
| **i18n (add)** | **i18next + react-i18next** |
| Icons | lucide-react |

---

## 7. Prompts to Give Claude Code (in order)

1. *"In this cloned shadcn-admin template, remove Clerk and set up JWT+refresh auth against my NestJS API (axios client, refresh interceptor, Zustand auth store, login page, role-based TanStack Router guards)."*
2. *"Add i18next + react-i18next with fr.json and ar.json, a language switcher in the header, and document `dir`/`lang` toggling for RTL. Convert layout components to Tailwind logical properties (ps-/pe-/ms-/me-)."*
3. *"Build the Orders feature: a TanStack Table listing orders with status filter, search, and pagination from GET /orders; an order detail page showing itemized lines, status timeline (order-events), customer + addresses, and a status-advance action calling the backend state machine."*
4. *"Build the Catalog feature: CRUD for service categories and items with bilingual (fr/ar) names and per_kilo/per_item pricing, using React Hook Form + Zod."*
5. *"Build the Scheduling feature: manage time slots and per-window capacity, showing current bookings."*
6. *"Build the Dashboard overview with KPI cards and Recharts charts (orders today, revenue, pending pickups, capacity utilization) from the relevant endpoints."*
7. *"Build the Customers feature: searchable table, order history per customer, and a WhatsApp contact link."*

---

## 8. Stack Summary

| Layer | Tech |
|---|---|
| Framework | React 19 + Vite 8 + TypeScript |
| UI | shadcn/ui + Tailwind 4 (bespoke) |
| Routing | TanStack Router |
| Data | TanStack Query + Axios → NestJS REST API |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Auth | JWT + refresh (your NestJS backend) |
| i18n | i18next + react-i18next, FR + AR (RTL) |
| Charts | Recharts / Tremor |

---

*Generated as a kickstart reference. Build the Orders feature first — it's the operational heart of the dashboard — then Scheduling and Catalog.*
