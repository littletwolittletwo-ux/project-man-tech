import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ItemForm } from "@/components/item-form";

export const metadata = { title: "New Wishlist Item — Client Wishlist" };

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("name")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Wishlist Item
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          for {client.name}
        </p>
      </div>
      <ItemForm clientId={id} />
    </div>
  );
}
