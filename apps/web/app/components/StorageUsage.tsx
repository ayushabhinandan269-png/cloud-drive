"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB quota

export default function StorageUsage() {
  const [usedBytes, setUsedBytes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("files")
        .select("size_bytes")
        .eq("user_id", user.id)
        .eq("is_trashed", false);

      if (!error && data) {
       const total = data.reduce(
       (sum: number, f: { size_bytes: number | null }) =>
             sum + (f.size_bytes ?? 0),
              0
         );

        setUsedBytes(total);
      }

      setLoading(false);
    }

    fetchUsage();
  }, []);

  const percentUsed = Math.min(
    Math.round((usedBytes / MAX_STORAGE_BYTES) * 100),
    100
  );

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700">
          Storage usage
        </span>
        <span className="text-xs text-zinc-500">
          {(usedBytes / (1024 * 1024)).toFixed(1)} MB / 1024 MB
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded bg-zinc-200">
        <div
          className={`h-full transition-all ${
            percentUsed > 80
              ? "bg-red-500"
              : "bg-zinc-900"
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {!loading && percentUsed > 80 && (
        <p className="mt-2 text-xs text-red-600">
          You’re running low on storage
        </p>
      )}
    </div>
  );
}
