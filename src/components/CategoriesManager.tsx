"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

const COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#eab308", "#6b7280"];

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createCategory({ name, color, icon: "tag" });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <p className="font-medium text-foreground">Categories</p>

      <ul className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-foreground">{c.name}</span>
            <button
              onClick={async () => {
                await deleteCategory(c.id);
                router.refresh();
              }}
              className="text-muted text-xs ml-1"
              aria-label={`Delete ${c.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={onAdd} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
          required
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
        <select value={color} onChange={(e) => setColor(e.target.value)} className="rounded-lg border border-border bg-surface px-2 py-2 text-sm">
          {COLORS.map((c) => (
            <option key={c} value={c} style={{ color: c }}>●</option>
          ))}
        </select>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-3 py-2 disabled:opacity-60">
          Add
        </button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
