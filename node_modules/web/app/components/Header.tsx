"use client";

import FileUpload from "./FileUpload";
import CreateFolder from "./CreateFolder";
import Link from "next/link";

export default function Header({
  onUploaded,
  onFolderCreated,
  currentFolderId,
  search,
  setSearch,
}: {
  onUploaded?: () => void;
  onFolderCreated?: () => void;
  currentFolderId?: string | null;
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3">
      
      {/* Left */}
      <h2 className="text-lg font-semibold text-zinc-800">
        My Drive
      </h2>

      {/* Center — SEARCH */}
      <div className="mx-6 flex-1 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search in Drive"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2
                     text-sm text-black placeholder:text-zinc-400
                     focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* ✅ Trash Navigation */}
        <Link
          href="/trash"
          className="rounded-md border px-3 py-2 text-sm
                     text-zinc-700 hover:bg-zinc-100"
        >
          Trash
        </Link>

        <CreateFolder
          parentId={currentFolderId ?? null}
          onCreated={onFolderCreated ?? (() => window.location.reload())}
        />

        <FileUpload
          folderId={currentFolderId ?? null}
          onUploaded={onUploaded}
        />
      </div>
    </header>
  );
}






