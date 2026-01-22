"use client";

import { useState } from "react";
import Modal from "./ui/Modal";
import DropdownMenu from "./ui/DropdownMenu";
import { supabase } from "@/lib/supabaseClient";

export default function FolderActions({
  folder,
  onDone,
}: {
  folder: any;
  onDone: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(folder.name);

  async function rename() {
    await supabase
      .from("folders")
      .update({ name })
      .eq("id", folder.id);

    setRenameOpen(false);
    onDone();
  }

  async function trash() {
    const ok = confirm("Move folder to trash?");
    if (!ok) return;

    await supabase
      .from("folders")
      .update({ is_trashed: true })
      .eq("id", folder.id);

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
        title="Rename Folder"
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
