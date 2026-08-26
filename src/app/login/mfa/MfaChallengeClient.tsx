"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function MfaChallengeClient() {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp.find((f) => f.status === "verified");
    if (factorsError || !factor) {
      setLoading(false);
      setError("No authenticator found for this account.");
      return;
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challengeError || !challenge) {
      setLoading(false);
      setError(challengeError?.message ?? "Could not start verification");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    });
    setLoading(false);
    if (verifyError) {
      setError("That code didn't match — check your authenticator app and try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground text-center">Enter your code</h1>
        <p className="text-muted text-sm text-center mt-1">Open your authenticator app for the 6-digit code.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-2xl tracking-[0.4em]"
            aria-label="6-digit code"
          />

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" disabled={loading || code.length !== 6} size="lg" className="w-full">
            {loading ? "Verifying…" : "Verify"}
          </Button>
        </form>
      </div>
    </main>
  );
}
