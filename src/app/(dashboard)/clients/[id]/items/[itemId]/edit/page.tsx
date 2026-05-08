import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ItemForm } from "@/components/item-form";
import type { Client, WishlistItem } from "@/lib/types";

export const metadata = { title: "Edit Item — Client Wishlist" };

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id: clientId, itemId } = await params;
  const supabase = await createClient();
  const profile = await getUserProfile();

  const [{ data: client }, { data: item }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase.from("wishlist_items").select("*").eq("id", itemId).single(),
  ]);

  if (!client || !item) notFound();

  const typedClient = client as Client;
  const canEdit =
    profile.role === "admin" || typedClient.owner_id === profile.id;
  if (!canEdit) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Item</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {(item as WishlistItem).title}
        </p>
      </div>
      <ItemForm clientId={clientId} item={item as WishlistItem} />
    </div>
  );
}
