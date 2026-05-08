import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Mail, Building2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusPill, PriorityBadge } from "@/components/status-badge";
import { CompletionCheckbox } from "@/components/completion-checkbox";
import { deleteClientAction } from "@/lib/actions";
import type { Client, WishlistItem } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("name").eq("id", id).single();
  return { title: data ? `${data.name} — Client Wishlist` : "Client" };
}

export default async function ClientDetailPage({
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

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const wishlistItems = (items || []) as WishlistItem[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {typedClient.name}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {typedClient.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {typedClient.company}
              </span>
            )}
            {typedClient.contact_email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {typedClient.contact_email}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button render={<Link href={`/clients/${id}/edit`} />} variant="outline" size="sm">
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            <form action={deleteClientAction}>
              <input type="hidden" name="id" value={id} />
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                type="submit"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </form>
          </div>
        )}
      </div>

      {typedClient.description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {typedClient.description}
        </p>
      )}

      <Separator />

      {/* Wishlist Items */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Wishlist Items
        </h2>
        {canEdit && (
          <Button render={<Link href={`/clients/${id}/items/new`} />} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No wishlist items yet.
          </p>
          {canEdit && (
            <Button render={<Link href={`/clients/${id}/items/new`} />} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="transition-colors hover:bg-accent/30">
              <CardContent className="flex items-center gap-4 p-4">
                <CompletionCheckbox item={item} />
                <Link
                  href={`/clients/${id}/items/${item.id}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        item.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {item.title}
                    </span>
                    <PriorityBadge priority={item.priority} />
                    <StatusPill status={item.status} />
                  </div>
                  {item.timeline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Timeline: {item.timeline}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
