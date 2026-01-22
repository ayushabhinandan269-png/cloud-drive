"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ContextMenu from "@/app/components/ui/ContextMenu";

export default function FileList({
  folderId,
}: {
  folderId: string | null;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: any;
  } | null>(null);

  // 🔹 RENAME STATE (NEW)
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [newName, setNewName] = useState("");

  async function fetchFiles() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_id", folderId)
      .eq("is_trashed", false)
      .order("created_at", { ascending: false });

    if (!error) setFiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles();
  }, [folderId]);

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

  async function deleteFile(file: any) {
    const ok = confirm(`Move "${file.name}" to Trash?`);
    if (!ok) return;

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

  // 🔹 HANDLE RENAME (OPTIMISTIC UPDATE)
  async function handleRename() {
    if (!renameTarget || !newName.trim()) return;

    const oldName = renameTarget.name;

    // optimistic UI update
    setFiles((prev) =>
      prev.map((f) =>
        f.id === renameTarget.id ? { ...f, name: newName } : f
      )
    );

    setRenameTarget(null);

    const { error } = await supabase
      .from("files")
      .update({ name: newName })
      .eq("id", renameTarget.id);

    if (error) {
      // rollback on error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === renameTarget.id ? { ...f, name: oldName } : f
        )
      );
      alert(error.message);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-zinc-700">Files</h2>

      {loading && (
        <p className="mt-3 text-sm text-zinc-500">Loading files...</p>
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
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                item: file,
              });
            }}
          >
            <div className="font-medium truncate">{file.name}</div>

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

      {/* 🔹 RENAME MODAL */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4">
            <h3 className="text-sm font-medium text-zinc-800">
              Rename file
            </h3>

            <input
              className="mt-3 w-full rounded border px-3 py-2 text-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded border px-3 py-1 text-sm"
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </button>

              <button
                className="rounded bg-zinc-900 px-3 py-1 text-sm text-white"
                onClick={handleRename}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CONTEXT MENU */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        >
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100">
            Open
          </button>

          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              setRenameTarget(contextMenu.item);
              setNewName(contextMenu.item.name);
              setContextMenu(null);
            }}
          >
            Rename
          </button>

          <button
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
            onClick={() => {
              deleteFile(contextMenu.item);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </ContextMenu>
      )}
    </div>
  );
}


