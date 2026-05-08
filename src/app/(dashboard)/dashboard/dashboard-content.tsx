"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, FolderOpen, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientWithCounts, Profile } from "@/lib/types";

function ClientCard({ client }: { client: ClientWithCounts }) {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="transition-colors hover:bg-accent/50 h-full">
        <CardContent className="p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">{client.name}</h3>
            {client.company && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {client.company}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3.5 w-3.5" />
              {client.open_count} open
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {client.completed_count} done
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {new Date(client.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

interface DashboardContentProps {
  profile: Profile;
  clients: ClientWithCounts[];
  employees: Profile[];
}

export function DashboardContent({
  profile,
  clients,
  employees,
}: DashboardContentProps) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const totalOpen = filtered.reduce((sum, c) => sum + c.open_count, 0);
  const totalCompleted = filtered.reduce(
    (sum, c) => sum + c.completed_count,
    0
  );

  if (profile.role === "admin") {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
              <span>{totalOpen} open items</span>
              <span>{totalCompleted} completed</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-60"
              />
            </div>
            <Button render={<Link href="/clients/new" />} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New Client
            </Button>
          </div>
        </div>

        {employees.map((emp) => {
          const empClients = filtered.filter((c) => c.owner_id === emp.id);
          return (
            <section key={emp.id} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {emp.full_name}&apos;s Clients
              </h2>
              {empClients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No clients found.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {empClients.map((c) => (
                    <ClientCard key={c.id} client={c} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  // Employee view
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your Clients</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-60"
            />
          </div>
          <Button render={<Link href="/clients/new" />} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No clients yet. Create your first one.
          </p>
          <Button render={<Link href="/clients/new" />} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}
    </div>
  );
}
