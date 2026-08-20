"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
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
    <Card className="space-y-3">
      <CardTitle>Categories</CardTitle>

      <ul className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-foreground">{c.name}</span>
            <button
              onClick={async () => {
                await deleteCategory(c.id);
                router.refresh();
              }}
              className="text-muted ml-0.5"
              aria-label={`Delete ${c.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={onAdd} className="flex items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" required className="flex-1 py-2" />
        <Select value={color} onChange={(e) => setColor(e.target.value)} className="w-16 py-2">
          {COLORS.map((c) => (
            <option key={c} value={c} style={{ color: c }}>●</option>
          ))}
        </Select>
        <Button type="submit" disabled={saving} size="sm">Add</Button>
      </form>
      {error && <Alert variant="danger">{error}</Alert>}
    </Card>
  );
}
