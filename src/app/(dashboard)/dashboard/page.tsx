import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { DashboardContent } from "./dashboard-content";
import type { ClientWithCounts, Profile } from "@/lib/types";

export const metadata = { title: "Dashboard — Client Wishlist" };

export default async function DashboardPage() {
  const profile = await getUserProfile();
  const supabase = await createClient();

  // Fetch clients with item counts
  let clientsQuery = supabase
    .from("clients")
    .select("*, wishlist_items(completed)")
    .order("updated_at", { ascending: false });

  // Employees only see their own clients (RLS handles this too, but be explicit)
  if (profile.role === "employee") {
    clientsQuery = clientsQuery.eq("owner_id", profile.id);
  }

  const { data: rawClients } = await clientsQuery;

  // Fetch profiles for admin view
  let profiles: Profile[] = [];
  if (profile.role === "admin") {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee");
    profiles = (data as Profile[]) || [];
  }

  // Transform to ClientWithCounts
  const clients: ClientWithCounts[] = (rawClients || []).map((c) => {
    const items = (c.wishlist_items as { completed: boolean }[]) || [];
    const completed_count = items.filter((i) => i.completed).length;
    const open_count = items.length - completed_count;
    const { wishlist_items: _, ...client } = c;
    return { ...client, open_count, completed_count };
  });

  return (
    <DashboardContent
      profile={profile}
      clients={clients}
      employees={profiles}
    />
  );
}
