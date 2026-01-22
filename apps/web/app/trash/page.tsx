"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FileItem = {
  id: string;
  name: string;
  size_bytes: number;
  storage_key: string;
};

export default function TrashPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTrash() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data } = await supabase
      .from("files")
      .select("id, name, size_bytes, storage_key")
      .eq("user_id", user.id)
      .eq("is_trashed", true)
      .order("created_at", { ascending: false });

    setFiles(data || []);
    setLoading(false);
  }

  //  RESTORE FILE
  async function restoreFile(file: FileItem) {
    const { error } = await supabase
      .from("files")
      .update({ is_trashed: false })
      .eq("id", file.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTrash();
  }

  //  DELETE FOREVER (PERMANENT)
  async function deleteForever(file: FileItem) {
    const ok = confirm(`Delete "${file.name}" permanently?`);
    if (!ok) return;

    // 1️⃣ Remove from storage
    const { error: storageError } = await supabase.storage
      .from("files")
      .remove([file.storage_key]);

    if (storageError) {
      alert(storageError.message);
      return;
    }

    // 2️⃣ Remove from database
    const { error: dbError } = await supabase
      .from("files")
      .delete()
      .eq("id", file.id);

    if (dbError) {
      alert(dbError.message);
      return;
    }

    fetchTrash();
  }

  useEffect(() => {
    fetchTrash();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-600">
        Loading Trash...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-zinc-800">
        Trash
      </h1>

      {files.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          Trash is empty.
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="rounded-xl border bg-white p-4
                       shadow-sm transition hover:shadow-md"
          >
            <div className="truncate font-medium text-zinc-800">
              {file.name}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {(file.size_bytes / 1024).toFixed(0)} KB
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => restoreFile(file)}
                className="rounded border px-3 py-1 text-xs
                           text-zinc-700 hover:bg-zinc-100"
              >
                Restore
              </button>

              <button
                onClick={() => deleteForever(file)}
                className="rounded border px-3 py-1 text-xs
                           text-red-600 hover:bg-red-50"
              >
                Delete forever
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

