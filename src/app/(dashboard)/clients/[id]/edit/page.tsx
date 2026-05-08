import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/client-form";
import type { Client, Profile } from "@/lib/types";

export const metadata = { title: "Edit Client — Client Wishlist" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getUserProfile();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const typedClient = client as Client;
  const canEdit =
    profile.role === "admin" || typedClient.owner_id === profile.id;
  if (!canEdit) notFound();

  let employees: Profile[] = [];
  if (profile.role === "admin") {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee");
    employees = (data as Profile[]) || [];
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Client</h1>
      <ClientForm
        client={typedClient}
        isAdmin={profile.role === "admin"}
        employees={employees}
      />
    </div>
  );
}
