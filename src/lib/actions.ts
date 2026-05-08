"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---- Clients ----

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const profile = await getUserProfile();

  const ownerIdRaw = formData.get("owner_id") as string;
  const owner_id =
    profile.role === "admin" && ownerIdRaw ? ownerIdRaw : profile.id;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      owner_id,
      name: formData.get("name") as string,
      company: (formData.get("company") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
      description: (formData.get("description") as string) || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("clients")
    .update({
      name: formData.get("name") as string,
      company: (formData.get("company") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/dashboard");
}

// ---- Wishlist Items ----

export async function createItemAction(formData: FormData) {
  const supabase = await createClient();
  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("wishlist_items").insert({
    client_id: clientId,
    title: formData.get("title") as string,
    overview: (formData.get("overview") as string) || null,
    requirements: (formData.get("requirements") as string) || null,
    outputs_capacities:
      (formData.get("outputs_capacities") as string) || null,
    tech_stack: (formData.get("tech_stack") as string) || null,
    logic_workflow: (formData.get("logic_workflow") as string) || null,
    additional_notes: (formData.get("additional_notes") as string) || null,
    priority: (formData.get("priority") as string) || "medium",
    timeline: (formData.get("timeline") as string) || null,
  });

  if (error) throw new Error(error.message);
  redirect(`/clients/${clientId}`);
}

export async function updateItemAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;

  const { error } = await supabase
    .from("wishlist_items")
    .update({
      title: formData.get("title") as string,
      overview: (formData.get("overview") as string) || null,
      requirements: (formData.get("requirements") as string) || null,
      outputs_capacities:
        (formData.get("outputs_capacities") as string) || null,
      tech_stack: (formData.get("tech_stack") as string) || null,
      logic_workflow: (formData.get("logic_workflow") as string) || null,
      additional_notes: (formData.get("additional_notes") as string) || null,
      priority: (formData.get("priority") as string) || "medium",
      timeline: (formData.get("timeline") as string) || null,
      status: (formData.get("status") as string) || "not_started",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  redirect(`/clients/${clientId}/items/${id}`);
}

export async function deleteItemAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  redirect(`/clients/${clientId}`);
}

export async function toggleItemCompletedAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true";

  const { error } = await supabase
    .from("wishlist_items")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      status: completed ? "completed" : "not_started",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateItemStatusAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completed = true;
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed = false;
    updates.completed_at = null;
  }

  const { error } = await supabase
    .from("wishlist_items")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---- Notes ----

export async function createNoteAction(formData: FormData) {
  const supabase = await createClient();
  const profile = await getUserProfile();
  const itemId = formData.get("item_id") as string;
  const content = formData.get("content") as string;

  if (!content?.trim()) return;

  const { error } = await supabase.from("item_notes").insert({
    item_id: itemId,
    author_id: profile.id,
    content: content.trim(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteNoteAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("item_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
