export function ProgressBar({ value, colorClass = "bg-primary" }: { value: number; colorClass?: string }) {
  const pct = Math.max(0, Math.min(value, 1)) * 100;
  return (
    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
