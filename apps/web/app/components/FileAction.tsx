"use client";

import { useState } from "react";
import Modal from "./ui/Modal";
import DropdownMenu from "./ui/DropdownMenu";
import { supabase } from "@/lib/supabaseClient";

export default function FileActions({
  file,
  onDone,
}: {
  file: any;
  onDone: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(file.name);

  async function rename() {
    await supabase
      .from("files")
      .update({ name })
      .eq("id", file.id);

    setRenameOpen(false);
    onDone();
  }

  async function trash() {
    const ok = confirm("Move file to trash?");
    if (!ok) return;

    await supabase
      .from("files")
      .update({ is_trashed: true })
      .eq("id", file.id);

    onDone();
  }

  return (
    <>
      <DropdownMenu>
        <button
          onClick={() => setRenameOpen(true)}
          className="block w-full px-3 py-2 text-left hover:bg-zinc-100"
        >
          Rename
        </button>
        <button
          onClick={trash}
          className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </DropdownMenu>

      <Modal
        open={renameOpen}
        title="Rename File"
        onClose={() => setRenameOpen(false)}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => setRenameOpen(false)}>Cancel</button>
          <button
            onClick={rename}
            className="rounded bg-black px-3 py-1 text-white"
          >
            Save
          </button>
        </div>
      </Modal>
    </>
  );
}
