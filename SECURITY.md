# Security Policy

AltsManager is designed to be self-hosted and handles sensitive financial and
tax data. This repo is the Next.js frontend; it talks to the
[API backend](https://github.com/AltsManager/api), where most of the
authentication/authorization logic lives.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.
Instead, report them privately using
[GitHub Security Advisories](https://github.com/AltsManager/web/security/advisories/new)
for this repository (or the
[api repo's advisories](https://github.com/AltsManager/api/security/advisories/new)
if the issue is in the backend), or by emailing **info@altsmanager.com**.

Include as much detail as you can: a description of the vulnerability and its
impact, steps to reproduce, and any relevant logs or proof-of-concept code.

We'll acknowledge your report, investigate, and keep you updated as we work
toward a fix.

## Supported versions

This project is pre-1.0 and under active development. Only the `main` branch
receives security fixes.

## Notes on this frontend's security model

- Authentication is cookie-based (httpOnly, `SameSite=Lax`, set by the API) --
  the session token is never readable from client-side JavaScript, which
  limits the impact of an XSS bug to session riding rather than token theft.
- Route gating in this app (e.g. redirecting unauthenticated users away from
  `(app)` routes) is a UX convenience, not a security boundary -- all real
  authorization is enforced by the API. Don't add client-only checks here as
  a substitute for server-side enforcement.
- See the [api repo's SECURITY.md](https://github.com/AltsManager/api/blob/main/SECURITY.md)
  for the backend's full security model, including its single-tenant
  authorization design.
