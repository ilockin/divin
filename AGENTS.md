# AI Agent Instructions for DivinArte

## Purpose
This repo currently contains a frontend React application only (visual phase, mock data). The most reliable source of product decisions is `memory/CONTEXT.md`; read it first before making architecture or feature changes.

## Key project structure
- `frontend/` - main application UI, built with Create React App + CRACO + Tailwind + shadcn/ui.
- `frontend/src/` - app pages, components, hooks, context, data, and UI primitives.
- `frontend/plugins/health-check/` - custom dev-server health check integration.
- `memory/CONTEXT.md` - master project document and source of truth for business, design, and architecture decisions.

## Run and build commands
Use the root workspace scripts or operate directly in `frontend/`.

- `yarn start` from root: runs `cd frontend && yarn start`
- `yarn build` from root: runs `cd frontend && yarn build`
- `yarn test` from root: runs `cd frontend && yarn test`

The frontend itself uses:
- `cd frontend && yarn start`
- `cd frontend && yarn build`
- `cd frontend && yarn test`

## Important conventions
- The frontend is a React app using CRA + CRACO.
- `frontend/craco.config.js` adds:
  - `@` alias for `frontend/src`
  - React hook lint rules
  - optional health-check middleware via `ENABLE_HEALTH_CHECK`
- The repo uses Yarn v1 in the frontend package.
- The project is designed for a Vercel + Supabase deployment model.
- The UI copy and marketing content should follow the Portuguese/Portugal brand tone in `memory/CONTEXT.md`.

## Architecture guidance
- Frontend is the only active codebase in this repo right now. There is no backend yet.
- The next phase (not started) is back-end: Supabase (PostgreSQL, Auth, RLS) + Edge Functions, per `memory/CONTEXT.md`.
- The admin and storefront UI should remain consistent with the current e-commerce/ERP concept in `memory/CONTEXT.md`.

## Testing and quality notes
- Keep frontend React hook rules and linting behavior intact.

## Known pitfalls
- The project plan in `memory/CONTEXT.md` is the long-term source of truth.
- Avoid introducing MongoDB as the long-term data platform — Supabase/PostgreSQL is the decided stack.
- The blog content is intentionally not translated by the interface i18n.

## Reference docs
- `README.md` - default CRA starter doc
- `frontend/README.md` - CRA frontend instructions
- `memory/CONTEXT.md` - project master document for product, design, architecture, and business rules
