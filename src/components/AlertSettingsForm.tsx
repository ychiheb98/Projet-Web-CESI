"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateAlertSettings } from "@/lib/actions/settings";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ToggleRow } from "@/components/ui/ToggleRow";
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
    <Card>
      <form onSubmit={onSubmit} className="space-y-3">
        <CardTitle>Email alerts</CardTitle>
        <div>
          <Label htmlFor="alert-email">Alert email</Label>
          <Input id="alert-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <ToggleRow
          accent="info"
          title="Daily digest"
          description="A daily email with your safe-to-spend amount."
          checked={dailyDigest}
          onCheckedChange={setDailyDigest}
        />

        <ToggleRow
          accent="warning"
          title="Overspend warnings"
          description="Warn me when I'm overspending or off track on a goal."
          checked={overspendAlerts}
          onCheckedChange={setOverspendAlerts}
        />

        <div>
          <Label htmlFor="threshold">Overspend threshold (% of planned pace)</Label>
          <Input id="threshold" type="number" min="100" max="300" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          <p className="text-xs text-muted mt-1.5">e.g. 110 alerts once you&rsquo;re 10% ahead of a straight-line budget pace.</p>
        </div>

        <div>
          <Label htmlFor="low-allowance">Alert if daily allowance drops below</Label>
          <Input id="low-allowance" type="number" min="0" value={lowAllowance} onChange={(e) => setLowAllowance(e.target.value)} />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {saved && <Alert variant="success">Saved.</Alert>}
        <Button type="submit" disabled={saving} size="sm">
          {saving ? "Saving…" : "Save alert settings"}
        </Button>
      </form>
    </Card>
  );
}
