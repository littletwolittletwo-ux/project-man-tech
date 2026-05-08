import { cn } from "@/lib/utils";
import type { Status, Priority } from "@/lib/types";

const statusStyles: Record<Status, string> = {
  not_started: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  blocked: "bg-red-500/10 text-red-600 dark:text-red-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const statusLabels: Record<Status, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  high: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  urgent: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        priorityStyles[priority]
      )}
    >
      {priority}
    </span>
  );
}
