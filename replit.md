# Dr.Arty Prime Herb — Replit Project

## Overview
E-commerce storefront and admin panel for Dr.Arty Prime Herb, a Thai men's premium supplement brand. Built with React + Vite + TypeScript + Tailwind CSS + shadcn/ui. Uses Supabase for the database, authentication, realtime subscriptions, and file storage.

## Architecture

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Routing**: React Router v6
- **State**: React Query (server state), React Context (cart, orders, auth)
- **Payments**: Stripe (via Supabase Edge Functions)
- **Notifications**: LINE Messaging API (via Supabase Edge Functions)

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, product section, reviews, FAQ |
| `/checkout` | Multi-step checkout (shipping → payment) |
| `/order-success/:orderNumber` | Post-purchase confirmation |
| `/tracking` | Order tracking by order number + contact |
| `/admin` | Admin dashboard (orders, products, coupons, articles, content calendar) |
| `/articles` | Blog/articles listing |
| `/articles/:slug` | Article detail |
| `/brand-story` | Brand story page |

## Environment Variables

Set in Replit Secrets or env vars:

| Key | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

## Supabase Edge Functions

The following Supabase Edge Functions handle server-side logic:
- `create-checkout` — Creates Stripe checkout sessions
- `stripe-webhook` — Handles Stripe payment webhooks, updates order status
- `send-order-email` — Sends transactional order emails
- `line-notify` — Sends LINE Flex Messages for order and content notifications

## Development

```bash
npm run dev       # Start dev server on port 5000
npm run build     # Production build to dist/
npm run start     # Serve built dist/ on port 3000 (for deployment)
```

## Deployment

- **Build**: `npm run build` (Vite outputs to `dist/`)
- **Run**: `npm run start` (serves `dist/` with `serve`)
- **Target**: Autoscale

## Database Schema (Supabase)

Tables: `products`, `orders`, `profiles`, `user_roles`, `coupons`, `articles`, `content_calendar`

Admin roles managed via `user_roles` table with `has_role()` security-definer function.
