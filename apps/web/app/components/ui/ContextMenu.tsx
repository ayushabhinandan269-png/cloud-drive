"use client";

import { useEffect } from "react";

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ContextMenu({
  x,
  y,
  onClose,
  children,
}: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border bg-white shadow-md"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // ✅ IMPORTANT
    >
      {children}
    </div>
  );
}

