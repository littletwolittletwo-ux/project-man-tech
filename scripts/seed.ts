import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: process.env.SEED_ERIC_EMAIL || "eric@example.com",
    password: process.env.SEED_ERIC_PASSWORD || "password123",
    full_name: "Eric",
    role: "employee" as const,
  },
  {
    email: process.env.SEED_PRITHVI_EMAIL || "prithvi@example.com",
    password: process.env.SEED_PRITHVI_PASSWORD || "password123",
    full_name: "Prithvi",
    role: "employee" as const,
  },
  {
    email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
    password: process.env.SEED_ADMIN_PASSWORD || "password123",
    full_name: "Admin",
    role: "admin" as const,
  },
];

async function seed() {
  for (const user of users) {
    console.log(`Seeding user: ${user.email}`);

    // Check if user already exists by listing users and filtering
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email === user.email
    );

    let userId: string;

    if (existing) {
      console.log(`  User ${user.email} already exists, skipping auth creation`);
      userId = existing.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error) {
        console.error(`  Error creating user ${user.email}:`, error.message);
        continue;
      }

      userId = data.user.id;
      console.log(`  Created auth user: ${userId}`);
    }

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error(
        `  Error upserting profile for ${user.email}:`,
        profileError.message
      );
    } else {
      console.log(`  Profile upserted for ${user.email}`);
    }
  }

  console.log("\nSeeding complete!");
}

seed().catch(console.error);
