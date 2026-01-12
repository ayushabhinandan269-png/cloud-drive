"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "./components/Header";

export default function Home() {
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: foldersData } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id);

    const { data: filesData } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setFolders(foldersData || []);
    setFiles(filesData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Header onUploaded={fetchData} />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-blue-600">
          My Drive
        </h1>

        <p className="mt-2 text-zinc-600">
          Your files and folders will appear here.
        </p>

        {/* FOLDERS */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-zinc-700">
            Folders
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-lg border bg-white p-4 text-black
                           hover:shadow-md hover:border-zinc-400
                           transition cursor-pointer"
              >
                📁 {folder.name}
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

          {!loading && files.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500">
              No files uploaded yet.
            </p>
          )}

          <div className="mt-2 grid grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="rounded-lg border bg-white p-4 text-black
                           hover:bg-zinc-50 hover:shadow-md
                           transition cursor-pointer"
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

