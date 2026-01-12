"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function FileUpload({
  folderId,
  onUploaded,
}: {
  folderId?: string | null;
  onUploaded?: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // 1️⃣ Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setUploading(false);
      return;
    }

    // 2️⃣ Create storage path
    const storageKey = `${user.id}/${crypto.randomUUID()}-${file.name}`;

    // 3️⃣ Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(storageKey, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    // 4️⃣ Insert file record into DB (PHASE 7.3 change)
    const { error: dbError } = await supabase.from("files").insert({
      name: file.name,
      size_bytes: file.size,
      storage_key: storageKey,
      user_id: user.id,
      folder_id: folderId ?? null, // ✅ NEW
    });

    if (dbError) {
      alert(dbError.message);
      setUploading(false);
      return;
    }

    // 5️⃣ Notify UI to refresh
    onUploaded?.();

    setUploading(false);
  }

  return (
    <label className="cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
      {uploading ? "Uploading..." : "Upload"}
      <input
        type="file"
        hidden
        onChange={handleUpload}
      />
    </label>
  );
}



