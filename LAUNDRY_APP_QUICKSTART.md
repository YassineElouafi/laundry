# Laundry App — Backend Quickstarter (NestJS)

A kickstart guide for building the API backend for an on-demand laundry service (Rinse-style) for a Moroccan market. Feed this file to Claude Code to bootstrap the project efficiently.

---

## 1. Recommended Boilerplate

Use **`brocoders/nestjs-boilerplate`** — it's the most popular, actively maintained NestJS starter and already ships with most of what we need.

**Repo:** https://github.com/brocoders/nestjs-boilerplate
**Stars:** ~4.3k · **Last updated:** actively (daily)

### Why this one
- ✅ **Auth** — JWT + refresh tokens, email/password, social login (Google, Apple, Facebook)
- ✅ **TypeORM + PostgreSQL** — our chosen DB
- ✅ **I18N** — built-in internationalization → **essential for French + Arabic (RTL)**
- ✅ **Mailing** — transactional emails (order confirmations, etc.)
- ✅ **Docker + docker-compose** — one-command local environment
- ✅ **File uploads** (local/S3) — for garment photos & damage reports
- ✅ **E2E + unit test setup**, Swagger API docs, CI config, hexagonal architecture

### Clone & init
```bash
git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git laundry-api
cd laundry-api
rm -rf .git && git init
cp env-example-relational .env
docker compose up -d postgres adminer maildev
npm install
npm run migration:run
npm run seed:run:relational
npm run start:dev
```
API runs at `http://localhost:3000` · Swagger docs at `http://localhost:3000/docs`

> Use the **relational (TypeORM/Postgres)** variant, not the Mongoose one. The repo README explains how to strip the document-db code if you want a leaner tree.

---

## 2. Domain Model (Core Entities)

Build these modules on top of the boilerplate's existing `users` / `auth`.

| Entity | Key fields | Notes |
|---|---|---|
| **User** | role (customer / driver / admin), phone, locale | extend boilerplate User; phone + OTP matters in MA |
| **Address** | label, line1, city, lat, lng, notes, isDefault | map pin + free-text notes (informal addresses) |
| **ServiceCategory** | name (i18n), icon, active | wash&fold, dry cleaning, ironing, shoes, carpets |
| **ServiceItem** | category, name (i18n), priceType (per_kilo/per_item), unitPrice | pricing catalog |
| **Order** | user, pickupAddress, deliveryAddress, status, totals, paymentMethod | central entity |
| **OrderItem** | order, serviceItem, qty/weight, lineTotal | itemized lines |
| **TimeSlot** | date, windowStart, windowEnd, capacity, booked | pickup/delivery scheduling |
| **OrderEvent** | order, status, timestamp, note | status timeline / audit trail |
| **Subscription** | user, frequency, slotPref, active | recurring pickups (Phase 2) |
| **Payment** | order, method (cod/cmi), status, amount, ref | COD + card |
| **Review** | order, rating, comment | trust & ratings |
| **DamageReport** | order, orderItem, photos, description, status | loss/damage flow |

### Order status flow
```
SCHEDULED → DRIVER_ASSIGNED → PICKED_UP → AT_FACILITY →
IN_CLEANING → READY → OUT_FOR_DELIVERY → DELIVERED
                                       ↘ (CANCELLED at any pre-cleaning stage)
```
Every transition writes an `OrderEvent` and triggers a notification (push + optional WhatsApp).

---

## 3. Suggested Module Structure
```
src/
├── auth/                 # (boilerplate) + add phone OTP
├── users/                # (boilerplate) extend with role + locale
├── addresses/
├── catalog/              # service-categories + service-items
├── orders/               # orders + order-items + order-events (state machine)
├── scheduling/           # time-slots, availability, capacity
├── payments/             # COD + CMI gateway adapter
├── subscriptions/        # Phase 2
├── reviews/
├── damage-reports/
├── notifications/        # FCM push + WhatsApp adapter
└── admin/                # dashboard endpoints, ops views
```

---

## 4. Morocco-Specific Integrations

| Need | Choice | Notes |
|---|---|---|
| **Card payments** | **CMI** (Centre Monétique Interbancaire) | dominant MA gateway; redirect/hosted page model. Build a `payments/cmi` adapter. Consider PayZone/Payd as alternatives. |
| **Cash on delivery** | First-class `paymentMethod = COD` | still the most-used method — driver marks paid on delivery |
| **Notifications** | **Firebase Cloud Messaging** (push) + **WhatsApp** | WhatsApp is the #1 channel in MA — use WhatsApp Business API (Meta) or Twilio for order updates & support |
| **Phone auth/OTP** | Twilio / Vonage / a local SMS aggregator | phone-first signup |
| **Maps & geocoding** | Google Maps Platform | address pins, driver routing |
| **Languages** | FR + AR (RTL) via boilerplate I18N | add Darija/EN later |

---

## 5. MVP Scope (Phase 1)

Build only this first:
1. Auth (phone OTP + email/password) and customer profile
2. Address management (map pin + notes, multiple addresses)
3. Service catalog with pricing (per-kilo and per-item)
4. Order creation with itemized lines
5. Pickup + delivery slot booking (capacity-aware)
6. Order status tracking + timeline + push notifications
7. Payments: **COD** + **one CMI card flow**
8. WhatsApp/in-app support link
9. Basic admin endpoints (list/manage orders, slots, catalog)

**Phase 2:** subscriptions/recurring, driver app + routing, reviews, damage reports, promo codes, analytics dashboard, loyalty.

---

## 6. Prompts to Give Claude Code

Paste these in sequence to save tokens (each is a focused task):

1. *"Using the brocoders/nestjs-boilerplate already cloned in this repo, add a `role` enum (customer/driver/admin) and `locale` + `phone` fields to the User entity, with a migration."*
2. *"Generate an `addresses` module (entity, DTOs, controller, service, migration) with label, line1, city, lat, lng, notes, isDefault, scoped to the authenticated user."*
3. *"Generate a `catalog` module with ServiceCategory and ServiceItem entities supporting i18n names and per_kilo/per_item pricing, with a seed of sample laundry services."*
4. *"Generate an `orders` module implementing the status state machine [paste flow above], with OrderItem and OrderEvent entities, and emit an event on each transition."*
5. *"Generate a `scheduling` module with capacity-aware TimeSlot booking for pickup and delivery."*
6. *"Add a `payments` module with a COD flow and a CMI gateway adapter (hosted-page redirect + callback verification)."*
7. *"Add a `notifications` module with an FCM push adapter and a WhatsApp Business API adapter, subscribed to order events."*

---

## 7. Stack Summary

| Layer | Tech |
|---|---|
| Backend | **NestJS** (this repo), TypeScript |
| DB | PostgreSQL + TypeORM |
| Auth | JWT + refresh, phone OTP |
| Mobile | React Native or Flutter (separate repo) |
| Push | Firebase Cloud Messaging |
| Payments | CMI + COD |
| Maps | Google Maps Platform |
| Infra | Docker · deploy to a VPS or AWS/Render |

---

*Generated as a kickstart reference. Adjust pricing model (per-kilo vs per-item) and payment gateway choice with your client before locking the schema.*
