import { getUserProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/client-form";
import type { Profile } from "@/lib/types";

export const metadata = { title: "New Client — Client Wishlist" };

export default async function NewClientPage() {
  const profile = await getUserProfile();
  let employees: Profile[] = [];

  if (profile.role === "admin") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee");
    employees = (data as Profile[]) || [];
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Client</h1>
      <ClientForm isAdmin={profile.role === "admin"} employees={employees} />
    </div>
  );
}
