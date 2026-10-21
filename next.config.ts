import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const isDev = process.env.NODE_ENV !== "production";

// Baseline CSP. script-src/style-src still allow 'unsafe-inline' because this
// app doesn't yet use nonces for Next's inline bootstrap scripts -- tightening
// that requires a nonce-based CSP wired up via middleware (see
// https://nextjs.org/docs/app/guides/content-security-policy). 'unsafe-eval'
// is dev-only, for Fast Refresh/HMR.
const contentSecurityPolicy = [
  "default-src 'self'",
  `connect-src 'self' ${apiUrl}`,
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
