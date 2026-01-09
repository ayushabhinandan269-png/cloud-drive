export default function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      {/* Left: Title */}
      <h2 className="text-lg font-semibold text-zinc-800">My Drive</h2>

      {/* Center: Search */}
      <div className="mx-6 flex-1 max-w-md">
        <input
         type="text"
         placeholder="Search in Drive"
         className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />

      </div>

      {/* Right: Actions */}
      <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
        Upload
      </button>
    </header>
  );
}
