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
import { createClientAction, updateClientAction } from "@/lib/actions";
import type { Client, Profile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  description: z.string().optional(),
  owner_id: z.string().optional(),
});

type ClientValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  isAdmin: boolean;
  employees: Profile[];
}

export function ClientForm({ client, isAdmin, employees }: ClientFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!client;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClientValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      company: client?.company || "",
      contact_email: client?.contact_email || "",
      description: client?.description || "",
      owner_id: client?.owner_id || "",
    },
  });

  const onSubmit = async (values: ClientValues) => {
    setSubmitting(true);
    const fd = new FormData();
    if (client) fd.set("id", client.id);
    fd.set("name", values.name);
    fd.set("company", values.company || "");
    fd.set("contact_email", values.contact_email || "");
    fd.set("description", values.description || "");
    if (values.owner_id) fd.set("owner_id", values.owner_id);

    try {
      if (isEdit) {
        await updateClientAction(fd);
      } else {
        await createClientAction(fd);
      }
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {isAdmin && employees.length > 0 && (
        <div className="space-y-2">
          <Label>Assign to Employee</Label>
          <Select
            defaultValue={client?.owner_id || ""}
            onValueChange={(val) => setValue("owner_id", val ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.full_name} ({e.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Client Name *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...register("company")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input id="contact_email" type="email" {...register("contact_email")} />
        {errors.contact_email && (
          <p className="text-sm text-destructive">
            {errors.contact_email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          {...register("description")}
          placeholder="Context about the client..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
