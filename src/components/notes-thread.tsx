"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader2 } from "lucide-react";
import { createNoteAction, deleteNoteAction } from "@/lib/actions";
import type { ItemNote, Profile } from "@/lib/types";
import { useRef, useTransition } from "react";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface NotesThreadProps {
  notes: (ItemNote & { author: Profile })[];
  itemId: string;
  profile: Profile;
}

export function NotesThread({ notes, itemId, profile }: NotesThreadProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createNoteAction(formData);
      formRef.current?.reset();
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Notes</h2>

      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex gap-3 rounded-lg border border-border p-3"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {getInitials(note.author?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {note.author?.full_name || "Unknown"}
                </span>
                <span>
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
            {(note.author_id === profile.id || profile.role === "admin") && (
              <form action={deleteNoteAction}>
                <input type="hidden" name="id" value={note.id} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                  type="submit"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* Add note form */}
      <form ref={formRef} action={handleSubmit} className="space-y-2">
        <input type="hidden" name="item_id" value={itemId} />
        <Textarea
          name="content"
          placeholder="Add a note..."
          rows={3}
          required
        />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Post Note
        </Button>
      </form>
    </div>
  );
}
