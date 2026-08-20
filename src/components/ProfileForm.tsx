"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/settings";
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
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <p className="font-medium text-foreground">Profile</p>
      <div>
        <label className="block text-xs text-muted mb-1">Display name</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Currency</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground">
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Timezone</label>
        <input
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="e.g. Europe/Paris"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
        <p className="text-xs text-muted mt-1">Used to figure out &ldquo;today&rdquo; and days left in the month.</p>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Saved.</p>}
      <button type="submit" disabled={saving} className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 disabled:opacity-60">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
