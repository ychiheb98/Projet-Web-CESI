import { connection } from "next/server";
import { MfaChallengeClient } from "./MfaChallengeClient";

// Forces dynamic rendering — see src/app/login/page.tsx for why.
export default async function MfaChallengePage() {
  await connection();
  return <MfaChallengeClient />;
}
