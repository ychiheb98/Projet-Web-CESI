import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const alertVariants = cva("rounded-xl border px-3.5 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-surface-inset text-foreground",
      success: "border-primary/30 bg-primary/10 text-primary",
      info: "border-info/30 bg-info/10 text-info",
      warning: "border-warning/30 bg-warning/10 text-warning",
      danger: "border-danger/30 bg-danger/10 text-danger",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
