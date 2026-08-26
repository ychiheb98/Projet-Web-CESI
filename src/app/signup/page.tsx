import { connection } from "next/server";
import { SignupClient } from "./SignupClient";

// Forces dynamic rendering — see src/app/login/page.tsx for why.
export default async function SignupPage() {
  await connection();
  return <SignupClient />;
}
