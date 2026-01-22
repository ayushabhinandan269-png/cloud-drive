"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FileItem = {
  id: string;
  name: string;
  size_bytes: number;
  storage_key: string; //FIX
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

  // ♻️ RESTORE FILE
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

  // ❌ DELETE FOREVER (PERMANENT)
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
     

   if (loading) {
  return (
    <div className="flex h-screen items-center justify-center text-zinc-600">
      Loading...
    </div>
  );
}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-zinc-800">
        Trash
      </h1>

      {loading && (
        <p className="mt-4 text-sm text-zinc-500">
          Loading trash...
        </p>
      )}

      {!loading && files.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          Trash is empty.
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="rounded-lg border bg-white p-4 text-black"
          >
            <div className="font-medium truncate">
              {file.name}
            </div>

            <div className="text-xs text-zinc-500 mt-1">
              {(file.size_bytes / 1024).toFixed(0)} KB
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => restoreFile(file)}
                className="text-xs rounded border px-3 py-1
                           hover:bg-zinc-100 text-zinc-700"
              >
                Restore
              </button>

              <button
                onClick={() => deleteForever(file)}
                className="text-xs rounded border px-3 py-1
                           text-red-600 hover:bg-red-50"
              >
                Delete Forever
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

