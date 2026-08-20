"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <p className="font-medium text-foreground">Two-factor authentication</p>
      <p className="text-xs text-muted -mt-2">
        Adds a 6-digit code from an authenticator app on top of your password. Strongly recommended since this app holds your real spending data.
      </p>

      {verifiedFactor ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-success font-medium">Enabled</span>
          <button onClick={() => unenroll(verifiedFactor.id)} disabled={busy} className="text-danger text-sm disabled:opacity-60">
            Turn off
          </button>
        </div>
      ) : enrolling && qrCode ? (
        <div className="space-y-3">
          <p className="text-sm text-foreground">Scan this in your authenticator app (Google Authenticator, 1Password, Authy…):</p>
          <div className="flex justify-center bg-white rounded-lg p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`} alt="TOTP QR code" width={180} height={180} />
          </div>
          {secret && (
            <p className="text-xs text-muted text-center break-all">Can&rsquo;t scan? Enter this key manually: {secret}</p>
          )}
          <div>
            <label className="block text-xs text-muted mb-1">6-digit code</label>
            <input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground tracking-widest text-center"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmEnroll}
              disabled={busy || code.length !== 6}
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Confirm"}
            </button>
            <button onClick={cancelEnroll} className="text-sm text-muted px-3">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={startEnroll} disabled={busy} className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 disabled:opacity-60">
          {busy ? "Starting…" : "Set up two-factor authentication"}
        </button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
