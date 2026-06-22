# Laundry — Implementation Plan (toward Rinse parity)

Maps the gaps from `rinse-workflow.md` to concrete work on this monorepo
(`apps/api` NestJS+TypeORM, `apps/dashboard` React, `packages/shared`).

## Where we are
**Built (the operational spine):** JWT auth (email/password), addresses, catalog
(i18n + per-kilo/per-item pricing), orders with a full status state machine +
timeline events, capacity-aware time slots, payments (COD + CMI), notification
adapters (FCM/WhatsApp **stubs**), and an **admin dashboard** (overview, orders,
catalog, scheduling, customers).

**Missing for parity:** customer & driver front-ends, driver assignment, slot↔order
linking, inventory/photos/QC, partner portal, subscriptions/reviews/damage reports,
phone OTP, real notifications, analytics/tracking/route-optimization.

## Guiding principles
- **Reuse the spine.** Most customer/driver actions already have API endpoints.
- **Entities via the generators** (`pnpm --filter @laundry/api generate:resource:relational`), never hand-written.
- **Shared contracts in `@laundry/shared`** (enums, DTO types) — consumed by every app.
- **New front-ends follow the dashboard recipe** (Vite + shadcn + i18n FR/AR + axios/auth from `@/lib/api`) and the **same deploy path** (Dockerfile → GHCR → Dokploy app via `infra/dokploy-provision.sh`).
- Sizes: **S** ≈ <1d, **M** ≈ 2–4d, **L** ≈ 1–2wk, **XL** ≈ 2–4wk.

---

## Phase 0 — Foundational fixes & wiring (unblocks everything)  ·  size **M**
Small backend/schema additions that make the existing flow operationally complete.

- **P0.1 Payments admin page** — fix the dead `/payments` sidebar link. Add admin `GET /payments` (list + filter by method/status); dashboard feature to reconcile COD and view CMI transactions. *(S)*
- **P0.2 Link slots ↔ orders** — add `pickupSlot` / `deliverySlot` (TimeSlot) refs on `Order`; on create, book the chosen slots (capacity-safe); on cancel, release. Extend `CreateOrderDto`. *(M)*
- **P0.3 Driver assignment** — add `driver` (User) ref on `Order`; `PATCH /orders/admin/:id/assign-driver`; auto-set `DRIVER_ASSIGNED`; driver-scoped `GET /orders/driver/mine`. Dashboard: assign-driver control on order detail + a **Drivers** admin page. *(M)*
- **P0.4 Delivery options & fees** — add `deliveryType` (doorstep/concierge) + delivery fee to order totals. *(S)*

**Deliverable:** admin can run the full op (assign drivers, see payments, slots attached to orders).

---

## Phase 1 — Customer app  ·  size **XL**  ·  depends on P0
New front-end `apps/customer` (the single biggest gap). **Decision: web PWA vs native** — see Decisions.

- Auth (register/login, **phone OTP** once P-cross is done), profile.
- Address management (map pin optional — see Maps).
- Catalog browse → **order builder** (pick services + qty, pickup/delivery address, pickup/delivery slot).
- Checkout: COD or CMI (hosted-page redirect + return handling).
- Order tracking (status timeline) + order history.
- Backend: customer endpoints already exist; add CMI return UX + slot selection (P0.2).
- Deploy: `apps/customer/Dockerfile` + nginx + add to `deploy.yml` build matrix + new Dokploy app via provisioner.

---

## Phase 2 — Driver app  ·  size **L**  ·  depends on P0.3
New front-end `apps/driver` (mobile-first PWA).

- Driver login (role=driver); **assigned orders / today's route**.
- Pickup flow: confirm, **QR scan** (order id), **photo capture** (wire `files` module to order events), status → `PICKED_UP`.
- Hand-off statuses (`AT_FACILITY`, `OUT_FOR_DELIVERY`), delivery confirm + photo → `DELIVERED`.
- Backend: driver-scoped endpoints (P0.3), photo upload linked to `OrderEvent`, order QR = encoded order id.

---

## Phase 3 — Inventory, photos & quality control  ·  size **L**
- **Garment** entity (order, tag/QR, category, color, notes, photos[], status) — per-garment tagging + counting.
- **QualityCheck** entity (order, itemsExpected/Verified, packagingOk, missingItems[], passedAt); **QC gate before `READY`**.
- Wire `files` for garment/QC photos; customer inventory report (read API + screen).
- Admin/partner UI: per-order inventory list + QC checklist.

---

## Phase 4 — Laundry partner portal  ·  size **L–XL**
- **Partner** entity + `partner` role; assign order → partner; partner-scoped endpoints; label data.
- New front-end `apps/partner`: receive orders, **print labels** (print CSS/PDF), manage inventory, update status.

---

## Phase 5 — Business features (Rinse "Phase 2")  ·  size **L**
- **Subscriptions** — `Subscription` entity (user, frequency, slot pref, services, active); install `@nestjs/schedule`; cron auto-creates recurring orders; customer management UI.
- **Reviews** — `Review` (order, rating, comment); customer submit + admin moderate.
- **Damage reports** — `DamageReport` (order, garment, photos, description, status); customer/driver create, admin resolve.
- **Saved payment methods** — `PaymentMethod` per user (COD default + card token if CMI supports tokenization).

---

## Phase 6 — Analytics, tracking & optimization (Rinse "Phase 3")  ·  size **L–XL**
- **Admin analytics** — revenue/volume trends, capacity utilization, driver performance, retention cohorts (aggregation endpoints + recharts).
- **ETA + live driver tracking** — driver geolocation + websockets (socket.io); customer live map.
- **Route optimization** — order driver stops (Google Maps / OR-Tools).
- **AI demand forecasting** — later, once data accumulates.

---

## Cross-cutting workstreams (slot in as needed)
- **Phone OTP auth** — SMS provider (Twilio/Vonage/local aggregator); add to auth. *(M)* — needed by Phase 1.
- **Real notifications** — replace stubs: Firebase Admin (FCM), WhatsApp (Meta Cloud API/Twilio). *(M)*
- **Maps & geocoding** — Google Maps Platform for address pins + routing. *(M)*
- **Deploy automation** — extend `deploy.yml` to build each new app image; add each as a Dokploy app via `infra/dokploy-provision.sh`. *(S each)*
- **Testing/CI** — unit + e2e per app; gate PRs.

---

## Decision points (need your call)
1. **Front-end platform for customer/driver apps:** **Web PWA** (recommended — fast, reuses the Vite/shadcn/shared stack + Dokploy deploy, installable on phones) vs **React Native/Expo** (true native + app stores, separate toolchain/deploy). Could ship PWA now, native later.
2. **External providers** (accounts + cost): SMS (phone OTP), WhatsApp Business, FCM/Firebase, Google Maps. Which to enable, and when.
3. **Partner portal priority** — build now (Phase 4) or defer if you're operating the laundry in-house initially.
4. **CMI tokenization** for saved cards — confirm CMI supports it; otherwise COD-first.

---

## Suggested milestones
| Milestone | Scope | Rough effort |
|---|---|---|
| **M1** | Phase 0 (admin operationally complete) | ~1 sprint |
| **M2** | Phase 1 customer app (+ phone OTP, real notifications, maps) | ~2–3 sprints |
| **M3** | Phase 2 driver app + Phase 3 inventory/QC | ~2–3 sprints |
| **M4** | Phase 4 partner portal | ~1–2 sprints |
| **M5** | Phase 5 subscriptions/reviews/damage | ~1–2 sprints |
| **M6** | Phase 6 analytics/tracking/optimization | ~2–4 sprints |

**Recommended start: Phase 0** — small, high-leverage schema additions (slots↔orders,
driver assignment, payments page) that the customer and driver apps then build on.
