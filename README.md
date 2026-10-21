# AltsManager (Web)

AltsManager is an open-source, privacy-oriented platform for tracking
alternative investments -- private stock, SAFE notes, real property, LLC
interests, private equity, VC fund LP positions, crypto, artwork, and more --
across multiple investing entities.

This repo is the frontend (Next.js App Router). It talks to the
[FastAPI backend](https://github.com/AltsManager/api), which owns the data
model, auth, and document storage. You'll need that API running locally to
use this app.

See also: [www.altsmanager.org](https://www.altsmanager.org).

## Requirements

- Node.js 20+
- The [api](https://github.com/AltsManager/api) backend running locally (see
  its README for setup) -- there is no signup flow here, since the API has
  none by design; bootstrap an admin user via the API's `create_admin` script.

## Setup

```bash
git clone https://github.com/AltsManager/web.git
cd web
npm install
cp .env.local.example .env.local   # defaults to http://localhost:8000
npm run dev
```

Visit http://localhost:3000 and sign in with a user created in the API.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the API backend. Public by design -- it's just where the browser sends requests, not a secret. |

## Development

```bash
npm run lint      # eslint
npm run build     # type-checks and builds a production bundle
```

## Auth

Sign-in sets an httpOnly session cookie on the API's domain; this app never
reads or stores the token itself (no `localStorage`/`sessionStorage` use).
Route gating in `(app)/layout.tsx` is a UX convenience -- the API is the real
authorization boundary. See [SECURITY.md](SECURITY.md) for more.

## Project structure

```
src/
  app/
    (app)/         authenticated app routes: entities, investments,
                   transactions, documents, counterparties
    login/         sign-in page
  components/      shared UI (including components/ui, shadcn/ui primitives)
  lib/api/         typed API client functions
```
