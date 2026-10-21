# Deploying to Datum Cloud

This repo deploys to [Datum Cloud](https://datum.net) Compute via
`.github/workflows/deploy.yml`, which runs on every push to `main`. See the
[api repo's DEPLOY.md](https://github.com/AltsManager/api/blob/main/DEPLOY.md)
for the shared infrastructure (Datum project, Compute access, service
account) -- this document only covers what's specific to the frontend.

## Status

- [ ] Everything in the api repo's DEPLOY.md status list, since this depends
  on the same project and Compute access
- [ ] `altsmanager-api` deployed at least once, so its public hostname exists
- [ ] `API_PUBLIC_URL` repository variable set to that hostname

## Why the build needs the API's URL upfront

`NEXT_PUBLIC_API_URL` is inlined into the client-side JavaScript bundle at
`next build` time -- it can't be supplied later, at deploy or run time, the
way a server-side env var can. So the api workload has to be deployed first
(at least once) to get its public hostname, and only then can this repo's
image be built with that URL baked in.

In steady state this isn't a problem: the api's public hostname is tied to
its Compute workload, not to any individual deploy, so it stays the same
across api releases. `API_PUBLIC_URL` only needs to be set once, not updated
on every deploy.

## One-time setup

1. Complete the api repo's setup through "First deploy", and note the
   `altsmanager-api` workload's public hostname.
2. In this repo's GitHub settings, add a repository **variable** (not secret --
   it ends up in client-side JS, so it's already public) named
   `API_PUBLIC_URL` set to that hostname, e.g. `https://altsmanager-api.<...>.datum.app`.
3. Add the same `DATUM_SERVICE_ACCOUNT_KEY` secret as the api repo (or a
   separate service account scoped the same way -- either works, since both
   deploy into the same `altsmanager` project).
4. Push to `main`, or run the `Deploy` workflow manually.

## Verify once Compute access is granted

Same open questions as the api repo's DEPLOY.md: whether repeated
`datumctl compute deploy` calls preserve prior settings, and the exact
non-interactive login behavior.

## Required GitHub secrets/variables

| Name | Type | Purpose |
|---|---|---|
| `DATUM_SERVICE_ACCOUNT_KEY` | secret | Service account credentials JSON for `datumctl login --credentials` |
| `API_PUBLIC_URL` | variable | The deployed api's public hostname, baked into the client bundle at build time |
