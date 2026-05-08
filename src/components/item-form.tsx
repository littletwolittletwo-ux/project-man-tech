"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemAction, updateItemAction } from "@/lib/actions";
import type { WishlistItem } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  overview: z.string().optional(),
  requirements: z.string().optional(),
  outputs_capacities: z.string().optional(),
  tech_stack: z.string().optional(),
  logic_workflow: z.string().optional(),
  additional_notes: z.string().optional(),
  priority: z.string(),
  timeline: z.string().optional(),
  status: z.string().optional(),
});

type ItemValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  clientId: string;
  item?: WishlistItem;
}

export function ItemForm({ clientId, item }: ItemFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: item?.title || "",
      overview: item?.overview || "",
      requirements: item?.requirements || "",
      outputs_capacities: item?.outputs_capacities || "",
      tech_stack: item?.tech_stack || "",
      logic_workflow: item?.logic_workflow || "",
      additional_notes: item?.additional_notes || "",
      priority: item?.priority || "medium",
      timeline: item?.timeline || "",
      status: item?.status || "not_started",
    },
  });

  const onSubmit = async (values: ItemValues) => {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("client_id", clientId);
    if (item) fd.set("id", item.id);
    Object.entries(values).forEach(([key, val]) => {
      fd.set(key, val || "");
    });

    try {
      if (isEdit) {
        await updateItemAction(fd);
      } else {
        await createItemAction(fd);
      }
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            defaultValue={item?.priority || "medium"}
            onValueChange={(val) => setValue("priority", val ?? "medium")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <Input
            id="timeline"
            placeholder="e.g. Q1 2026, 2 weeks"
            {...register("timeline")}
          />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            defaultValue={item?.status || "not_started"}
            onValueChange={(val) => setValue("status", val ?? "not_started")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="overview">Overview</Label>
        <Textarea
          id="overview"
          rows={3}
          placeholder="What is this software/feature?"
          {...register("overview")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          rows={3}
          placeholder="What it needs to do..."
          {...register("requirements")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputs_capacities">Outputs / Capacities</Label>
        <Textarea
          id="outputs_capacities"
          rows={3}
          placeholder="Expected outputs, capacity, scale..."
          {...register("outputs_capacities")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tech_stack">Tech Stack</Label>
        <Textarea
          id="tech_stack"
          rows={2}
          placeholder="Preferred or required technologies..."
          {...register("tech_stack")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logic_workflow">Logic & Workflow</Label>
        <Textarea
          id="logic_workflow"
          rows={3}
          placeholder="Current workflow and logic..."
          {...register("logic_workflow")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_notes">Additional Notes</Label>
        <Textarea
          id="additional_notes"
          rows={3}
          placeholder="Anything else important..."
          {...register("additional_notes")}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Item"}
        </Button>
      </div>
    </form>
  );
}
