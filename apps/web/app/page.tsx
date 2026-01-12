"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "./components/Header";

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
};

export default function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Track current folder
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Breadcrumbs
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);

  // Search
  const [search, setSearch] = useState("");

  async function fetchData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: foldersData } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .eq("parent_id", currentFolderId);

    const { data: filesData } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_id", currentFolderId)
      .order("created_at", { ascending: false });

    setFolders(foldersData || []);
    setFiles(filesData || []);
    setLoading(false);
  }

  // Breadcrumb builder
  async function fetchBreadcrumbs(folderId: string | null) {
    if (!folderId) {
      setBreadcrumbs([]);
      return;
    }

    let path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const { data, error }: { data: Folder | null; error: any } =
        await supabase
          .from("folders")
          .select("id, name, parent_id")
          .eq("id", currentId)
          .single();

      if (error || !data) break;

      path.unshift(data);
      currentId = data.parent_id;
    }

    setBreadcrumbs(path);
  }

  // ✅ RENAME FOLDER
  async function renameFolder(folder: Folder) {
    const newName = prompt("Rename folder", folder.name);
    if (!newName || newName === folder.name) return;

    const { error } = await supabase
      .from("folders")
      .update({ name: newName })
      .eq("id", folder.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchData();
  }

  // ✅ RENAME FILE
  async function renameFile(file: FileItem) {
    const newName = prompt("Rename file", file.name);
    if (!newName || newName === file.name) return;

    const { error } = await supabase
      .from("files")
      .update({ name: newName })
      .eq("id", file.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchData();
  }

  useEffect(() => {
    fetchData();
    fetchBreadcrumbs(currentFolderId);
  }, [currentFolderId]);

  // Search filters
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

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

        <p className="mt-2 text-zinc-600">
          Your files and folders will appear here.
        </p>

        {/* BREADCRUMBS */}
        <div className="mt-4 mb-2 flex items-center gap-2 text-sm text-zinc-600">
          <span
            onClick={() => setCurrentFolderId(null)}
            className="cursor-pointer hover:underline"
          >
            My Drive
          </span>

          {breadcrumbs.map((folder) => (
            <span key={folder.id} className="flex items-center gap-2">
              <span>/</span>
              <span
                onClick={() => setCurrentFolderId(folder.id)}
                className="cursor-pointer hover:underline"
              >
                {folder.name}
              </span>
            </span>
          ))}
        </div>

        {/* BACK BUTTON */}
        {currentFolderId && breadcrumbs.length > 0 && (
          <button
            onClick={() => {
              const parent =
                breadcrumbs.length > 1
                  ? breadcrumbs[breadcrumbs.length - 2]
                  : null;

              setCurrentFolderId(parent ? parent.id : null);
            }}
            className="mb-4 text-sm rounded border px-3 py-1
                       hover:bg-zinc-100 text-zinc-700"
          >
            ← Back
          </button>
        )}

        {/* FOLDERS */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-zinc-700">
            Folders
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-4">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-lg border bg-white p-4 text-black
                           hover:shadow-md hover:border-zinc-400
                           transition"
              >
                <div
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="cursor-pointer"
                >
                  📁 {folder.name}
                </div>

                <button
                  onClick={() => renameFolder(folder)}
                  className="mt-2 text-xs rounded border px-2 py-1
                             hover:bg-zinc-100 text-zinc-700"
                >
                  Rename
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FILES */}
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-700">
            Files
          </h2>

          {loading && (
            <p className="mt-3 text-sm text-zinc-500">
              Loading files...
            </p>
          )}

          {!loading && filteredFiles.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500">
              No files found.
            </p>
          )}

          <div className="mt-2 grid grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-lg border bg-white p-4 text-black
                           hover:bg-zinc-50 hover:shadow-md
                           transition"
              >
                <div className="font-medium truncate">
                  {file.name}
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  {(file.size_bytes / 1024).toFixed(0)} KB
                </div>

                <button
                  onClick={() => renameFile(file)}
                  className="mt-2 text-xs rounded border px-2 py-1
                             hover:bg-zinc-100 text-zinc-700"
                >
                  Rename
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}








