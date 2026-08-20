import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-border bg-surface-inset px-3.5 py-2.5 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-xs font-medium uppercase tracking-wide text-muted mb-1.5", className)} {...props} />;
}
