import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// A selectable tile: neutral by default, tinted border + fill + text in its
// accent color when selected. Used for pickers (category, period, difficulty
// style choices) instead of native <select> wherever there are few options.
const optionCardVariants = cva(
  "rounded-xl border px-3 py-2.5 text-sm font-medium text-center transition-colors",
  {
    variants: {
      accent: {
        primary: "",
        info: "",
        warning: "",
        danger: "",
      },
      selected: {
        true: "",
        false: "border-border bg-surface-inset text-foreground hover:border-muted",
      },
    },
    compoundVariants: [
      { accent: "primary", selected: true, className: "border-primary bg-primary/10 text-primary" },
      { accent: "info", selected: true, className: "border-info bg-info/10 text-info" },
      { accent: "warning", selected: true, className: "border-warning bg-warning/10 text-warning" },
      { accent: "danger", selected: true, className: "border-danger bg-danger/10 text-danger" },
    ],
    defaultVariants: { accent: "primary", selected: false },
  }
);

export interface OptionCardProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof optionCardVariants> {}

export function OptionCard({ className, accent, selected, type = "button", ...props }: OptionCardProps) {
  return <button type={type} className={cn(optionCardVariants({ accent, selected }), className)} {...props} />;
}
