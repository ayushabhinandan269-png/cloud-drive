"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "./components/Header";

/* ================= TYPES ================= */

type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
};

type FileItem = {
  id: string;
  name: string;
  size_bytes: number;
  folder_id: string | null;
  storage_key: string;
};

/* ================= PAGE ================= */

export default function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");

  const [draggedItem, setDraggedItem] = useState<{
    type: "file" | "folder";
    id: string;
  } | null>(null);

  /* ================= FETCH DATA ================= */

  async function fetchData() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setFolders([]);
        setFiles([]);
        return;
      }

      let foldersQuery = supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_trashed", false);

      foldersQuery =
        currentFolderId === null
          ? foldersQuery.is("parent_id", null)
          : foldersQuery.eq("parent_id", currentFolderId);

      const { data: foldersData } = await foldersQuery;

      let filesQuery = supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_trashed", false)
        .order("created_at", { ascending: false });

      filesQuery =
        currentFolderId === null
          ? filesQuery.is("folder_id", null)
          : filesQuery.eq("folder_id", currentFolderId);

      const { data: filesData } = await filesQuery;

      setFolders(foldersData || []);
      setFiles(filesData || []);
    } finally {
      setLoading(false);
    }
  }

  /* ================= FILE PREVIEW ================= */

  async function previewFile(file: FileItem) {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_key, 60);

    if (error || !data) {
      alert("Preview failed");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  /* ================= BREADCRUMBS ================= */

  async function fetchBreadcrumbs(folderId: string | null) {
    if (!folderId) {
      setBreadcrumbs([]);
      return;
    }

    let path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const { data } = await supabase
        .from("folders")
        .select("id, name, parent_id")
        .eq("id", currentId)
        .single();

       const folder = data as Folder | null;
      if (!folder) break;

      path.unshift(folder);
      currentId = folder.parent_id;
    }

    setBreadcrumbs(path);
  }

      

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchData();
    fetchBreadcrumbs(currentFolderId);
  }, [currentFolderId]);

  /* ================= SEARCH ================= */

  const filteredFolders = useMemo(
    () => folders.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    ),
    [folders, search]
  );

  const filteredFiles = useMemo(
    () => files.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    ),
    [files, search]
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-600">
        Loading...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div>
      <Header
        onUploaded={fetchData}
        currentFolderId={currentFolderId}
        search={search}
        setSearch={setSearch}
      />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-blue-600">
          My Drive
        </h1>

        {/* ================= FOLDERS ================= */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-zinc-700">
            Folders
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-4">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                draggable
                onDragStart={() =>
                  setDraggedItem({ type: "folder", id: folder.id })
                }
                onClick={() => setCurrentFolderId(folder.id)}
                className="rounded-lg border bg-white p-4 text-black
                           hover:shadow-md hover:border-zinc-400 transition cursor-pointer"
              >
                📁 {folder.name}
              </div>
            ))}
          </div>
        </div>

        {/* ================= FILES ================= */}
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-700">
            Files
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={() =>
                  setDraggedItem({ type: "file", id: file.id })
                }
                onClick={() => previewFile(file)}
                className="rounded-lg border bg-white p-4 text-black
                           hover:bg-zinc-50 hover:shadow-md transition cursor-pointer"
              >
                <div className="font-medium truncate">
                  {file.name}
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  {(file.size_bytes / 1024).toFixed(0)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}






















