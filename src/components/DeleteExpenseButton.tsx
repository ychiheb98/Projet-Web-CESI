"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/lib/actions/expenses";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted" aria-label="Delete expense">
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete this expense?</DialogTitle>
        <DialogDescription>This can&rsquo;t be undone.</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" className="flex-1">Cancel</Button>
          </DialogClose>
          <Button
            variant="danger"
            className="flex-1"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteExpense(id);
                setOpen(false);
                router.refresh();
              })
            }
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
