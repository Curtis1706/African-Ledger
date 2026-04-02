# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is a SaaS accounting app for African SMEs called "ComptaAfrica".

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Routing**: wouter

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Frontend (`artifacts/compta-africa`)

React + Vite SaaS dashboard with dark mode by default. Pages:
- `/dashboard` — Financial overview, KPI cards, revenue chart, alerts
- `/transactions` — Transaction list with filters and add dialog
- `/invoices` — Invoice management with status tracking
- `/invoices/new` — Invoice creation form with line items
- `/clients` — Client directory with search
- `/clients/:id` — Client detail with transaction history
- `/expenses` — Expense tracker with category breakdown
- `/reports` — Financial reports with monthly chart
- `/settings` — User profile and theme toggle

### Backend (`artifacts/api-server`)

Express 5 REST API at `/api`. Routes:
- `/api/dashboard/*` — Dashboard summary, chart data, activity, alerts
- `/api/transactions` — CRUD
- `/api/invoices` — CRUD with status management
- `/api/clients` — CRUD with transaction history
- `/api/expenses` — CRUD + category totals
- `/api/reports/*` — Monthly reports and financial summary

### Database (`lib/db`)

PostgreSQL tables:
- `clients` — Client directory
- `transactions` — Revenue and expense transactions
- `invoices` — Invoice management with JSON items
- `expenses` — Dedicated expense tracking

## Currency / Localization

- All amounts in FCFA (XOF)
- Dates in French
- Target market: West African SMEs

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
