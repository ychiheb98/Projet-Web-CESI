"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/settings";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Profile } from "@/lib/types";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"];

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [currency, setCurrency] = useState(profile.currency);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateProfile({ display_name: displayName || null, currency, timezone });
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
        <CardTitle>Profile</CardTitle>
        <div>
          <Label htmlFor="display-name">Display name</Label>
          <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. Europe/Paris" />
          <p className="text-xs text-muted mt-1.5">Used to figure out &ldquo;today&rdquo; and days left in the month.</p>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {saved && <Alert variant="success">Saved.</Alert>}
        <Button type="submit" disabled={saving} size="sm">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </Card>
  );
}
