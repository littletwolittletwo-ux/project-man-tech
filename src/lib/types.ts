export type Role = "employee" | "admin";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "not_started" | "in_progress" | "blocked" | "completed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Client {
  id: string;
  owner_id: string;
  name: string;
  company: string | null;
  contact_email: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  client_id: string;
  title: string;
  overview: string | null;
  requirements: string | null;
  outputs_capacities: string | null;
  tech_stack: string | null;
  logic_workflow: string | null;
  additional_notes: string | null;
  priority: Priority;
  timeline: string | null;
  status: Status;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemNote {
  id: string;
  item_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface ClientWithCounts extends Client {
  open_count: number;
  completed_count: number;
  owner?: Profile;
}
