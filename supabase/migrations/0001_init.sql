-- ============================================================
-- Schema: Client Wishlist Dashboard
-- ============================================================

-- Helper functions for RLS
create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function owns_client(p_client_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from clients
    where id = p_client_id and owner_id = auth.uid()
  );
$$;

-- ============================================================
-- profiles: extends auth.users with role
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null check (role in ('employee', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid() or is_admin());

create policy "Admin can update any profile"
  on profiles for update
  using (is_admin());

create policy "Users can update own profile (non-role fields)"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Allow insert for service role (seeding)"
  on profiles for insert
  with check (true);

-- ============================================================
-- clients: owned by an employee, visible to admin
-- ============================================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  company text,
  contact_email text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clients enable row level security;

create policy "Owners and admins can view clients"
  on clients for select
  using (owner_id = auth.uid() or is_admin());

create policy "Authenticated users can insert clients"
  on clients for insert
  with check (auth.uid() is not null);

create policy "Owner or admin can update clients"
  on clients for update
  using (owner_id = auth.uid() or is_admin());

create policy "Owner or admin can delete clients"
  on clients for delete
  using (owner_id = auth.uid() or is_admin());

-- ============================================================
-- wishlist_items: the software the client wants built
-- ============================================================
create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  overview text,
  requirements text,
  outputs_capacities text,
  tech_stack text,
  logic_workflow text,
  additional_notes text,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  timeline text,
  status text not null default 'not_started' check (status in ('not_started','in_progress','blocked','completed')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table wishlist_items enable row level security;

create policy "Wishlist items visible to owner or admin"
  on wishlist_items for select
  using (owns_client(client_id) or is_admin());

create policy "Wishlist items insertable by owner or admin"
  on wishlist_items for insert
  with check (owns_client(client_id) or is_admin());

create policy "Wishlist items updatable by owner or admin"
  on wishlist_items for update
  using (owns_client(client_id) or is_admin());

create policy "Wishlist items deletable by owner or admin"
  on wishlist_items for delete
  using (owns_client(client_id) or is_admin());

-- ============================================================
-- item_notes: thread of notes/comments on a wishlist item
-- ============================================================
create table item_notes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references wishlist_items(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table item_notes enable row level security;

-- To check if user can see a note, we need to check the parent item's client
create or replace function can_see_item(p_item_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from wishlist_items wi
    join clients c on c.id = wi.client_id
    where wi.id = p_item_id
      and (c.owner_id = auth.uid() or is_admin())
  );
$$;

create policy "Notes visible if user can see parent item"
  on item_notes for select
  using (can_see_item(item_id));

create policy "Notes insertable if user can see parent item"
  on item_notes for insert
  with check (can_see_item(item_id) and author_id = auth.uid());

create policy "Notes updatable by author or admin"
  on item_notes for update
  using (author_id = auth.uid() or is_admin());

create policy "Notes deletable by author or admin"
  on item_notes for delete
  using (author_id = auth.uid() or is_admin());

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

create trigger wishlist_items_updated_at
  before update on wishlist_items
  for each row execute function update_updated_at();
