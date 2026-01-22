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

  // 🔹 Rename
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [newName, setNewName] = useState("");

  // 🔹 Undo delete
  const [undoItem, setUndoItem] = useState<any | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // 🔹 Bulk select (NEW)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  async function fetchFiles() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_id", folderId)
      .eq("is_trashed", false)
      .order("created_at", { ascending: false });

    setFiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles();
  }, [folderId]);

  function toggleSelect(fileId: string) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }

  async function previewFile(file: any) {
    const { data } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_key, 60);

    if (!data) return alert("Preview failed");
    window.open(data.signedUrl, "_blank");
  }

  async function downloadFile(file: any) {
    const { data } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_key, 60);

    if (!data) return alert("Download failed");
    window.open(data.signedUrl, "_blank");
  }

  async function deleteFile(file: any) {
    const ok = confirm(`Move "${file.name}" to Trash?`);
    if (!ok) return;

    await supabase
      .from("files")
      .update({ is_trashed: true })
      .eq("id", file.id);

    setUndoItem(file);
    setShowUndo(true);
    fetchFiles();

    setTimeout(() => {
      setShowUndo(false);
      setUndoItem(null);
    }, 5000);
  }

  async function undoDelete() {
    if (!undoItem) return;

    await supabase
      .from("files")
      .update({ is_trashed: false })
      .eq("id", undoItem.id);

    setShowUndo(false);
    setUndoItem(null);
    fetchFiles();
  }

  async function handleRename() {
    if (!renameTarget || !newName.trim()) return;

    const oldName = renameTarget.name;

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
      <h2 className="text-sm font-semibold text-zinc-700">Files</h2>

      {loading && (
        <p className="mt-4 text-sm text-zinc-500">Loading files…</p>
      )}

      {!loading && files.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          No files uploaded yet.
        </p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-5">
        {files.map((file) => (
          <div
            key={file.id}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                item: file,
              });
            }}
            className={`group relative rounded-xl border p-4 shadow-sm transition
              ${
                selectedFiles.has(file.id)
                  ? "border-zinc-900 bg-zinc-50"
                  : "bg-white hover:shadow-md hover:bg-zinc-50"
              }
            `}
          >
            {/* Bulk select checkbox */}
            <input
              type="checkbox"
              checked={selectedFiles.has(file.id)}
              onChange={() => toggleSelect(file.id)}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 h-4 w-4 accent-zinc-900 opacity-0 group-hover:opacity-100"
            />

            <div className="truncate font-medium text-zinc-800">
              {file.name}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {(file.size_bytes / 1024).toFixed(0)} KB
            </div>

            <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => previewFile(file)}
                className="rounded border px-3 py-1 text-xs hover:bg-zinc-100"
              >
                Preview
              </button>

              <button
                onClick={() => downloadFile(file)}
                className="rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-800"
              >
                Download
              </button>

              <button
                onClick={() => deleteFile(file)}
                className="rounded border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Trash
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {selectedFiles.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2
                        flex items-center gap-4 rounded-lg
                        bg-white px-4 py-3 shadow-lg border">
          <span className="text-sm text-zinc-700">
            {selectedFiles.size} selected
          </span>

          <button
            className="text-sm text-red-600 hover:underline"
            onClick={async () => {
              for (const id of selectedFiles) {
                const file = files.find((f) => f.id === id);
                if (file) await deleteFile(file);
              }
              setSelectedFiles(new Set());
            }}
          >
            Delete
          </button>

          <button
            className="text-sm text-zinc-600 hover:underline"
            onClick={() => setSelectedFiles(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
            <h3 className="text-sm font-semibold">Rename file</h3>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-3 w-full rounded border px-3 py-2 text-sm"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="rounded border px-3 py-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="rounded bg-zinc-900 px-3 py-1 text-sm text-white"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        >
          <button className="menu-item">Open</button>

          <button
            className="menu-item"
            onClick={() => {
              setRenameTarget(contextMenu.item);
              setNewName(contextMenu.item.name);
              setContextMenu(null);
            }}
          >
            Rename
          </button>

          <button
            className="menu-item text-red-600"
            onClick={() => {
              deleteFile(contextMenu.item);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </ContextMenu>
      )}

      {/* Undo Snackbar */}
      {showUndo && undoItem && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg">
          <span>“{undoItem.name}” moved to Trash</span>
          <button
            onClick={undoDelete}
            className="ml-4 font-medium underline"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}



