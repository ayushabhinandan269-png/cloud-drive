"use client";

import { useState } from "react";

export default function DropdownMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 text-lg"
      >
        ⋮
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 w-36 rounded-md border bg-white shadow"
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
