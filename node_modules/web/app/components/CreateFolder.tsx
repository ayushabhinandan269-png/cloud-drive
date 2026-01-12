"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CreateFolder({
  parentId,
  onCreated,
}: {
  parentId?: string | null;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("folders").insert({
      name,
      user_id: user.id,
      parent_id: parentId ?? null,
    });

    if (error) {
      alert(error.message);
    } else {
      setName("");
      onCreated(); // refresh folders
    }

    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New folder name"
        className="rounded border px-3 py-1 text-sm text-black"
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-800"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
