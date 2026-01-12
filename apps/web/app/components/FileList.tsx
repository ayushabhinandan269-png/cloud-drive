"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FileList() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      .order("created_at", { ascending: false });

    if (!error) setFiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles();
  }, []);

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
            className="rounded-lg border bg-white p-4 text-black"
          >
            <div className="font-medium truncate">
              {file.name}
            </div>
            <div className="text-xs text-zinc-500">
              {(file.size_bytes / 1024).toFixed(0)} KB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
