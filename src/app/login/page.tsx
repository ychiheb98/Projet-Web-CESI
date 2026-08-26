import { connection } from "next/server";
import { LoginClient } from "./LoginClient";

// Forces dynamic rendering: this page's inline scripts need this request's
// CSP nonce (see src/proxy.ts), which only exists once a real request comes
// in — a page prerendered at build time would ship with no nonce at all.
export default async function LoginPage() {
  await connection();
  return <LoginClient />;
}
