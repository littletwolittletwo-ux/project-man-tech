"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateItemStatusAction } from "@/lib/actions";
import type { WishlistItem } from "@/lib/types";
import { useTransition } from "react";

export function StatusSelect({ item }: { item: WishlistItem }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string | null) => {
    if (!value) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", item.id);
      fd.set("status", value);
      await updateItemStatusAction(fd);
    });
  };

  return (
    <Select
      defaultValue={item.status}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-40 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="not_started">Not Started</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
}
