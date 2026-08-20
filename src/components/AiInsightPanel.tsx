"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getAiInsight } from "@/lib/ai/insights";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          AI coach
        </CardTitle>
        <Button onClick={onClick} disabled={loading} variant="secondary" size="sm">
          {loading ? "Thinking…" : message ? "Refresh" : "Get insight"}
        </Button>
      </CardHeader>
      {message && <p className="text-sm text-foreground leading-relaxed">{message}</p>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!message && !error && <p className="text-sm text-muted">Get a plain-language read on how this month is going.</p>}
    </Card>
  );
}
