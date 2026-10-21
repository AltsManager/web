# Contributing to AltsManager (Web)

Thanks for your interest in contributing. This project is early and the UI
is still taking shape, so it's worth opening an issue to discuss larger
changes before investing time in a PR.

This is the Next.js frontend; it talks to the
[API backend](https://github.com/AltsManager/api), which you'll generally
need running locally too (see that repo's README).

## Getting set up

```bash
npm install
cp .env.local.example .env.local   # points NEXT_PUBLIC_API_URL at your local api
npm run dev
```

Open http://localhost:3000.

## Before opening a PR

```bash
npm run lint
npm run build
```

## Pull requests

- Keep PRs focused — one logical change per PR is easier to review.
- Match the existing component/styling conventions (shadcn/ui + Tailwind).
- Security-sensitive changes (auth flow, API client, anything touching
  credentials or tokens) get extra scrutiny — see
  [SECURITY.md](SECURITY.md) for this app's security model.

## Code of conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you're expected to uphold it.
