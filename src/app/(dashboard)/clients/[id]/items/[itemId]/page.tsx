import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusPill, PriorityBadge } from "@/components/status-badge";
import { CompletionCheckbox } from "@/components/completion-checkbox";
import { StatusSelect } from "@/components/status-select";
import { NotesThread } from "@/components/notes-thread";
import { deleteItemAction } from "@/lib/actions";
import type { WishlistItem, Client, ItemNote, Profile } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("title")
    .eq("id", itemId)
    .single();
  return { title: data ? `${data.title} — Client Wishlist` : "Item" };
}

function DetailSection({
  label,
  content,
}: {
  label: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id: clientId, itemId } = await params;
  const supabase = await createClient();
  const profile = await getUserProfile();

  const [{ data: client }, { data: item }, { data: notes }] = await Promise.all(
    [
      supabase.from("clients").select("*").eq("id", clientId).single(),
      supabase
        .from("wishlist_items")
        .select("*")
        .eq("id", itemId)
        .single(),
      supabase
        .from("item_notes")
        .select("*, author:profiles(*)")
        .eq("item_id", itemId)
        .order("created_at", { ascending: true }),
    ]
  );

  if (!client || !item) notFound();

  const typedClient = client as Client;
  const typedItem = item as WishlistItem;
  const typedNotes = (notes || []) as (ItemNote & { author: Profile })[];

  const canEdit =
    profile.role === "admin" || typedClient.owner_id === profile.id;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/clients/${clientId}`}
          className="hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {typedClient.name}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <CompletionCheckbox item={typedItem} />
              <h1
                className={`text-2xl font-semibold tracking-tight ${
                  typedItem.completed
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {typedItem.title}
              </h1>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button render={<Link href={`/clients/${clientId}/items/${itemId}/edit`} />} variant="outline" size="sm">
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <form action={deleteItemAction}>
                  <input type="hidden" name="id" value={itemId} />
                  <input type="hidden" name="client_id" value={clientId} />
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

          <div className="space-y-5">
            <DetailSection label="Overview" content={typedItem.overview} />
            <DetailSection
              label="Requirements"
              content={typedItem.requirements}
            />
            <DetailSection
              label="Outputs / Capacities"
              content={typedItem.outputs_capacities}
            />
            <DetailSection
              label="Tech Stack"
              content={typedItem.tech_stack}
            />
            <DetailSection
              label="Logic & Workflow"
              content={typedItem.logic_workflow}
            />
            <DetailSection
              label="Additional Notes"
              content={typedItem.additional_notes}
            />
          </div>

          <Separator />

          {/* Notes Thread */}
          <NotesThread notes={typedNotes} itemId={itemId} profile={profile} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:border-l lg:border-border lg:pl-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Priority
              </p>
              <PriorityBadge priority={typedItem.priority} />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Status
              </p>
              {canEdit ? (
                <StatusSelect item={typedItem} />
              ) : (
                <StatusPill status={typedItem.status} />
              )}
            </div>

            {typedItem.timeline && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Timeline
                </p>
                <p className="text-sm">{typedItem.timeline}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm">
                {new Date(typedItem.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Updated
              </p>
              <p className="text-sm">
                {new Date(typedItem.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {typedItem.completed_at && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Completed
                </p>
                <p className="text-sm">
                  {new Date(typedItem.completed_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
