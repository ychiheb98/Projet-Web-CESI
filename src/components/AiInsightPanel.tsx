"use client";

import { useState } from "react";
import { getAiInsight } from "@/lib/ai/insights";

export function AiInsightPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    setError(null);
    const result = await getAiInsight();
    setLoading(false);
    if (result.ok) setMessage(result.message);
    else setError(result.error);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium text-foreground">AI coach</h2>
        <button
          onClick={onClick}
          disabled={loading}
          className="text-sm rounded-full bg-primary/10 text-primary px-3 py-1.5 font-medium disabled:opacity-60"
        >
          {loading ? "Thinking…" : message ? "Refresh" : "Get insight"}
        </button>
      </div>
      {message && <p className="text-sm text-foreground mt-3 leading-relaxed">{message}</p>}
      {error && <p className="text-sm text-danger mt-3">{error}</p>}
      {!message && !error && <p className="text-sm text-muted mt-3">Get a plain-language read on how this month is going.</p>}
    </div>
  );
}
