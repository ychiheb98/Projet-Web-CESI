"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";

type Factor = { id: string; friendly_name?: string; factor_type: string; status: string };

export function MfaSettings() {
  const supabase = createClient();
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refreshFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, not a render loop
    refreshFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "Budget" });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrolling(true);
  }

  async function confirmEnroll() {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error || !data) {
      setBusy(false);
      setError(error?.message ?? "Could not start verification");
      return;
    }
    const verify = await supabase.auth.mfa.verify({ factorId, challengeId: data.id, code });
    setBusy(false);
    if (verify.error) {
      setError("That code didn't match — check your authenticator app and try again.");
      return;
    }
    setEnrolling(false);
    setQrCode(null);
    setSecret(null);
    setCode("");
    await refreshFactors();
  }

  async function unenroll(id: string) {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await refreshFactors();
  }

  function cancelEnroll() {
    setEnrolling(false);
    setQrCode(null);
    setSecret(null);
    setCode("");
    setError(null);
  }

  const verifiedFactor = factors?.find((f) => f.status === "verified");

  return (
    <Card className="space-y-3">
      <CardTitle>Two-factor authentication</CardTitle>
      <p className="text-xs text-muted -mt-2">
        Adds a 6-digit code from an authenticator app on top of your password. Strongly recommended since this app holds your real spending data.
      </p>

      {verifiedFactor ? (
        <div className="flex items-center justify-between">
          <Badge variant="primary">Enabled</Badge>
          <Button variant="ghost" size="sm" className="text-danger" onClick={() => unenroll(verifiedFactor.id)} disabled={busy}>
            Turn off
          </Button>
        </div>
      ) : enrolling && qrCode ? (
        <div className="space-y-3">
          <p className="text-sm text-foreground">Scan this in your authenticator app (Google Authenticator, 1Password, Authy…):</p>
          <div className="flex justify-center bg-white rounded-xl p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`} alt="TOTP QR code" width={180} height={180} />
          </div>
          {secret && (
            <p className="text-xs text-muted text-center break-all">Can&rsquo;t scan? Enter this key manually: {secret}</p>
          )}
          <Input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="tracking-widest text-center"
            aria-label="6-digit code"
          />
          <div className="flex gap-2">
            <Button onClick={confirmEnroll} disabled={busy || code.length !== 6} size="sm" className="flex-1">
              {busy ? "Verifying…" : "Confirm"}
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEnroll}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={startEnroll} disabled={busy} size="sm">
          {busy ? "Starting…" : "Set up two-factor authentication"}
        </Button>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
    </Card>
  );
}
