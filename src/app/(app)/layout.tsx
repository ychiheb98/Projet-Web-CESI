import Link from "next/link";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/actions/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-lg px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold tracking-tight text-foreground">Budget</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="px-2">Sign out</Button>
          </form>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-4 pb-24">{children}</main>

      <Link
        href="/expenses/new"
        className="fixed right-4 bottom-20 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </Link>

      <div className="mx-auto w-full max-w-lg">
        <BottomNav />
      </div>
    </div>
  );
}
