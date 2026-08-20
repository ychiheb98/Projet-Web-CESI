"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Today", icon: "🏠" },
  { href: "/expenses", label: "Expenses", icon: "🧾" },
  { href: "/budgets", label: "Budgets", icon: "📊" },
  { href: "/goals", label: "Goals", icon: "🎯" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  active ? "text-primary font-medium" : "text-muted"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
