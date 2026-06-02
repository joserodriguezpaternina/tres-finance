# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

The repo has a single nested app. All application code lives inside `ts-finance/`. The root only contains `netlify.toml` (deploy config) and `skills-lock.json`.

```
tres-finance/
├── netlify.toml          # Netlify: builds from ts-finance/, publishes dist/
└── ts-finance/           # The entire React app lives here
    ├── src/
    │   ├── App.jsx            # Root component: routing, global state, nav
    │   ├── main.jsx           # React entry point
    │   ├── constants.js       # Design tokens (T), date helpers, categories, formatters
    │   ├── ui.jsx             # Shared UI components (KPI, Pill, buttons, grid)
    │   ├── Modals.jsx         # All 4 modal forms (income, expense, recurring, client)
    │   ├── supabase.js        # Supabase client init + embedded SQL schema
    │   ├── dataService.js     # CRUD service for incomes/expenses/recurring
    │   ├── clientService.js   # CRUD service for clients + auto-sync from incomes
    │   ├── exportService.js   # Excel (xlsx) and PDF (jsPDF) export
    │   ├── recurringSync.js   # Auto-generates recurring expense entries on load
    │   └── views/             # 7 page-level components
    ├── public/                # Static assets (custom fonts)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Commands

All commands must be run from inside `ts-finance/`:

```bash
cd ts-finance

npm run dev       # Start Vite dev server on http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

There are no tests, no linter, and no type checker configured in this project.

## Environment Variables

Create `ts-finance/.env` (not committed):

```
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJXXXX...
```

Without these, the app falls back to **localStorage** automatically (see `dataService.js`).

## Architecture

### State Management

All global state lives in `App.jsx` as plain `useState` hooks — there is no Redux, Zustand, or Context API. State is passed down as props:

- `incomes`, `expenses`, `recurring`, `clients` — full arrays loaded on mount
- `month` (0–11) — the active month filter
- `year` is hardcoded to `2026`

Data is always **refetched from the service layer after any mutation** (upsert/remove), not updated optimistically.

### Data Service Layer (`dataService.js`, `clientService.js`)

Each service exposes `getAll()`, `upsert(item)`, `remove(id)`. They transparently use Supabase if credentials exist, or fall back to localStorage. Field names are normalized between Supabase snake_case and JS camelCase on read/write:

| Supabase column | JS property |
|---|---|
| `has_iva` | `hasIVA` |
| `iva_p` | `ivaP` |
| `day_of_month` | `dayOfMonth` |

Clients are also auto-synced: when a new income is saved with an unknown client name, `clientService` creates the client record automatically.

### Recurring Expense Auto-Sync (`recurringSync.js`)

On every app load, `recurringSync` generates expense records for any active recurring template that doesn't yet have an entry for the current month/year. It uses `recurringKey(id, year, month)` as an idempotency key stored in the expense's `id` field to prevent duplicates.

### Design System (`constants.js` + `ui.jsx`)

The entire visual language is defined as inline style objects — there is no CSS framework or stylesheet. Design tokens live in the `T` object in `constants.js`:

```js
T.bg      // #F9F9F8  — page background
T.surf    // #FFFFFF  — card/surface
T.text    // #0F0E0C  — primary text (tres Studio brand black)
T.green   // income/positive
T.red     // expense/negative
T.amber   // warning/pending
```

Shared components in `ui.jsx` include `KPI` (metric cards with sparklines), `Pill` (status badges), and button style objects (`btnGreen`, `btnRed`, `btnGhost`). Always use these rather than recreating them.

### Modals (`Modals.jsx`)

All four creation/edit forms are in a single 29K file. Each modal receives an `open` boolean, an optional `initial` record for editing, and `onSave`/`onClose` callbacks. IVA (19%) is calculated live inside the form.

## Database Schema

The SQL schema is documented inside `src/supabase.js`. Four tables: `incomes`, `expenses`, `recurring`, `clients`. All use RLS with a permissive public policy (reads and writes allowed with the anon key). IDs are client-generated strings, not UUID sequences.

## Domain Conventions

- The app is in **Spanish** — all UI labels, category names, and user-facing text should remain in Spanish.
- **IVA** = Colombian VAT at 19%. Always stored as the gross amount; net/IVA split is computed on display.
- Currency formatting uses Colombian pesos (COP) via `formatCurrency` in `constants.js`.
- Payment methods: Transferencia, Efectivo, Tarjeta crédito, Nequi, Cheque, Otro.
- Income statuses: Pagado, Pendiente, Parcial.

## Deployment

Hosted on Netlify. The `netlify.toml` at the repo root sets `base = "ts-finance"`, `build = "npm run build"`, and `publish = "dist"`. A `[[redirects]]` rule sends all paths to `index.html` for SPA routing.
