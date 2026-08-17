import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";

/*
 * Phase E4 — Browser / Client Security
 *
 * PrivacyMap is intentionally a public, browser-only assessment application.
 * These headers provide defence-in-depth without requiring authentication or
 * a server-side database.
 *
 * Note: Next/React and the current application use inline styles. Therefore
 * style-src and script-src retain the minimum compatibility allowances needed
 * by the current architecture. A nonce-based CSP can be introduced later if
 * the application is migrated away from inline styles/scripts.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self'${isDevelopment ? " 'unsafe-eval'" : ""} 'unsafe-inline'`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isDevelopment
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/assessment/:path*",
        headers: [
          // Assessment content is client-side only. Avoid intermediary/browser
          // caching of the application response as an additional defence-in-depth
          // measure. This does not affect localStorage-based continuity.
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
