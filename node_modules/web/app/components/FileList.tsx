"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FileList({
  folderId,
}: {
  folderId: string | null;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFiles() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // ✅ UPDATED: hide trashed files
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_id", folderId)
      .eq("is_trashed", false) // ✅ PHASE 11
      .order("created_at", { ascending: false });

    if (!error) setFiles(data || []);
    setLoading(false);
  }

  // Refetch when folder changes
  useEffect(() => {
    fetchFiles();
  }, [folderId]);

  // 👁 PREVIEW FILE
  async function previewFile(file: any) {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_key, 60);

    if (error || !data) {
      alert("Preview failed");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  // ⬇ DOWNLOAD FILE
  async function downloadFile(file: any) {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_key, 60);

    if (error || !data) {
      alert("Download failed");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  // 🗑 SOFT DELETE (TRASH)
  async function deleteFile(file: any) {
    const ok = confirm(`Move "${file.name}" to Trash?`);
    if (!ok) return;

    // ✅ UPDATED: soft delete only
    const { error } = await supabase
      .from("files")
      .update({ is_trashed: true })
      .eq("id", file.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchFiles();
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-zinc-700">Files</h2>

      {loading && (
        <p className="mt-3 text-sm text-zinc-500">
          Loading files...
        </p>
      )}

      {!loading && files.length === 0 && (
        <p className="mt-3 text-sm text-zinc-500">
          No files uploaded yet.
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="rounded-lg border bg-white p-4 text-black
                       hover:bg-zinc-50 hover:shadow-md transition"
          >
            <div className="font-medium truncate">
              {file.name}
            </div>

            <div className="text-xs text-zinc-500 mt-1">
              {(file.size_bytes / 1024).toFixed(0)} KB
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => previewFile(file)}
                className="text-xs rounded border px-3 py-1 text-zinc-700 hover:bg-zinc-100"
              >
                Preview
              </button>

              <button
                onClick={() => downloadFile(file)}
                className="text-xs rounded bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-800"
              >
                Download
              </button>

              <button
                onClick={() => deleteFile(file)}
                className="text-xs rounded border px-3 py-1 text-red-600 hover:bg-red-50"
              >
                Trash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


