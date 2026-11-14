# Demo Admin + User panels

Run `npm install && npm run dev`, then open **/demo** (or `/admin/dashboard`, `/panel/dashboard`).
No Supabase/DB/env vars are needed for these routes (middleware bypasses `/admin`, `/panel`, `/demo`).

## Structure
- `src/app/admin/*`, `src/app/panel/*` – route shells (catch-all -> page registry)
- `src/components/demo/apps.tsx` – nav + route -> page registries (add a screen = add one line)
- `src/components/demo/crud.tsx` – generic table/form/search/sort/export/actions engine
- `src/components/demo/panel-crud.tsx`, `panel-special.tsx` – user-panel modules
- `src/components/demo/admin-pages.tsx` – admin modules

## Data source (provision for a real DB)
All screens use `db` / `useCollection` from `src/lib/demo/store.ts`. Demo data lives in
`src/lib/demo/seed.ts` and persists in localStorage (Profile menu -> Reset demo data).
To use a database, implement `DataProvider` (list/create/update/remove) against Next.js
route handlers and call `setDataProvider(...)`. No screen changes needed.

## Payment gateway (PG) provision
`src/lib/payments/index.ts` defines `PaymentGateway`. Razorpay / Stripe / Paytm / Demo are
simulated. Replace `charge()` with a server route (create order -> checkout -> webhook) or
`registerGateway()` a new provider. Admin -> Payment Gateway manages keys, mode and default.
Checkout (User -> Settings -> Billing & Plan -> Upgrade) writes payments + subscriptions visible in Admin.
