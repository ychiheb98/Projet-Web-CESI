"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateAlertSettings } from "@/lib/actions/settings";
import type { AlertSettings } from "@/lib/types";

export function AlertSettingsForm({ settings }: { settings: AlertSettings }) {
  const router = useRouter();
  const [email, setEmail] = useState(settings.email);
  const [dailyDigest, setDailyDigest] = useState(settings.daily_digest);
  const [overspendAlerts, setOverspendAlerts] = useState(settings.overspend_alerts);
  const [threshold, setThreshold] = useState(String(settings.overspend_threshold_pct));
  const [lowAllowance, setLowAllowance] = useState(String(settings.low_allowance_threshold));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateAlertSettings({
      email,
      daily_digest: dailyDigest,
      overspend_alerts: overspendAlerts,
      overspend_threshold_pct: threshold,
      low_allowance_threshold: lowAllowance,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <p className="font-medium text-foreground">Email alerts</p>
      <div>
        <label className="block text-xs text-muted mb-1">Alert email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={dailyDigest} onChange={(e) => setDailyDigest(e.target.checked)} />
        Send me a daily digest with my safe-to-spend amount
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={overspendAlerts} onChange={(e) => setOverspendAlerts(e.target.checked)} />
        Warn me when I&rsquo;m overspending or off track on a goal
      </label>

      <div>
        <label className="block text-xs text-muted mb-1">Overspend threshold (% of planned pace)</label>
        <input type="number" min="100" max="300" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
        <p className="text-xs text-muted mt-1">e.g. 110 alerts once you&rsquo;re 10% ahead of a straight-line budget pace.</p>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Alert if daily allowance drops below</label>
        <input type="number" min="0" value={lowAllowance} onChange={(e) => setLowAllowance(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Saved.</p>}
      <button type="submit" disabled={saving} className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 disabled:opacity-60">
        {saving ? "Saving…" : "Save alert settings"}
      </button>
    </form>
  );
}
