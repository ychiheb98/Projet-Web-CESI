import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-helper";

// CSP has to be built here (not as a static header in next.config.ts)
// because it needs a fresh nonce every request — Next.js's App Router
// injects small inline scripts to stream server-rendered data to the
// client, and those only run under a strict script-src if they carry this
// request's nonce. See node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", // inline style="" attrs (progress bars) aren't covered by script nonces
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);
  return updateSession(request, nonce, csp);
}

export const config = {
  matcher: [
    // Skip static assets, images, and the PWA/manifest/icon routes.
    "/((?!_next/static|_next/image|manifest|sw\\.js|icons/|apple-icon|icon\\.|favicon\\.ico).*)",
  ],
};
