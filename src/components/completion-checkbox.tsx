"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { toggleItemCompletedAction } from "@/lib/actions";
import type { WishlistItem } from "@/lib/types";
import { useTransition } from "react";

export function CompletionCheckbox({ item }: { item: WishlistItem }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", item.id);
      fd.set("completed", String(!item.completed));
      await toggleItemCompletedAction(fd);
    });
  };

  return (
    <Checkbox
      checked={item.completed}
      onCheckedChange={handleChange}
      disabled={isPending}
      className="shrink-0"
    />
  );
}
