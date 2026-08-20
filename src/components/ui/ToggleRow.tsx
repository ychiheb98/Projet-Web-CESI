import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Switch } from "@/components/ui/Switch";

// A toggle wrapped in its own accent-tinted card, borrowed from the pattern
// of pairing each on/off option with a color that hints at what it means
// (e.g. a cautionary amber for something riskier).
const rowVariants = cva("flex items-start gap-3 rounded-xl border px-3.5 py-3", {
  variants: {
    accent: {
      primary: "border-primary/30 bg-primary/10",
      info: "border-info/30 bg-info/10",
      warning: "border-warning/30 bg-warning/10",
      neutral: "border-border bg-surface-inset",
    },
  },
  defaultVariants: { accent: "neutral" },
});

const labelAccent: Record<NonNullable<VariantProps<typeof rowVariants>["accent"]>, string> = {
  primary: "text-primary",
  info: "text-info",
  warning: "text-warning",
  neutral: "text-foreground",
};

export interface ToggleRowProps extends VariantProps<typeof rowVariants> {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function ToggleRow({ title, description, checked, onCheckedChange, accent = "neutral", className }: ToggleRowProps) {
  return (
    <label className={cn(rowVariants({ accent }), "cursor-pointer", className)}>
      <div className="flex-1">
        <p className={cn("text-sm font-medium", labelAccent[accent ?? "neutral"])}>{title}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
