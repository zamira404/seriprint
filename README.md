This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Cloud Upload Security (Antivirus)

The Cloud page validates uploads server-side (`PDF`, `JPG/JPEG`, `SVG`, max size per file) and can scan files with ClamAV.

### 1) Start ClamAV locally

```bash
docker compose -f docker-compose.clamav.yml up -d
```

### 2) Configure env

In `.env.local`:

```env
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310
CLAMAV_TIMEOUT_MS=8000
CLAMAV_REQUIRED=true
```

- `CLAMAV_REQUIRED=true` means fail-closed: if scanner is unavailable, upload is blocked.
- `CLAMAV_REQUIRED=false` means fail-open: format/size validation still works, scanner is optional.

### 3) Verify scanner health

```bash
curl http://localhost:3000/api/cloud/antivirus-health
```

Expected (healthy): HTTP `200` with `{ "ok": true, ... }`.

## Payment -> Production Pipeline

When payment is confirmed, the app now creates a production order payload (print job) with customer data, totals, product customization, and cloud-print references.

### Flow

1. Checkout sends full order payload to payment API.
2. API creates a draft order (`draft_id`).
3. `draft_id` is attached to Stripe metadata / PayPal custom_id.
4. On payment confirmation (Stripe webhook or verify endpoint, PayPal capture), draft is finalized as production order.
5. Admin can read production orders from:

```bash
GET /api/admin/production/orders
```

If `ADMIN_API_TOKEN` is configured, pass it as:

```bash
Authorization: Bearer <ADMIN_API_TOKEN>
```

or query param `?token=...`.

### Important note (MVP persistence)

Current production orders are persisted in a local file: `data/production-orders.json`.  
This survives local restarts, but is still not suitable for serverless production (e.g. Vercel), where filesystem is ephemeral.  
For production, replace with a real DB (e.g. Postgres) and object storage for print assets.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
