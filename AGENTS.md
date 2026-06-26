# AI Agent Instructions for DivinArte

## Purpose
This repo contains a frontend React application and a small backend prototype. The most reliable source of product decisions is `memory/CONTEXT.md`; read it first before making architecture or feature changes.

## Key project structure
- `frontend/` - main application UI, built with Create React App + CRACO + Tailwind + shadcn/ui.
- `frontend/src/` - app pages, components, hooks, context, data, and UI primitives.
- `frontend/plugins/health-check/` - custom dev-server health check integration.
- `backend/` - FastAPI prototype server currently using MongoDB/Motor.
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
  - `@emergentbase/visual-edits` support in dev mode when installed
- The repo uses Yarn v1 in the frontend package.
- The project is designed for a Vercel + Supabase deployment model.
- The UI copy and marketing content should follow the Portuguese/Portugal brand tone in `memory/CONTEXT.md`.

## Architecture guidance
- Frontend is the primary active codebase in this repo.
- `backend/server.py` is a FastAPI prototype that currently connects to MongoDB, but `memory/CONTEXT.md` says the final stack should be Supabase/PostgreSQL and not MongoDB.
- Prefer implementing new business logic and data access as Supabase Edge Functions + PostgreSQL, rather than extending MongoDB-based backend code.
- The admin and storefront UI should remain consistent with the current e-commerce/ERP concept in `memory/CONTEXT.md`.

## Testing and quality notes
- `backend/pytest.ini` fixes xdist to `-n 2 --dist loadscope` and explicitly warns not to modify it.
- Keep frontend React hook rules and linting behavior intact.

## Known pitfalls
- Do not assume the backend is the authoritative implementation; the project plan in `memory/CONTEXT.md` is the long-term source of truth.
- Avoid introducing MongoDB as the long-term data platform.
- The blog content is intentionally not translated by the interface i18n.

## Reference docs
- `README.md` - default CRA starter doc
- `frontend/README.md` - CRA frontend instructions
- `memory/CONTEXT.md` - project master document for product, design, architecture, and business rules
