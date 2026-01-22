import "./globals.css";
import Link from "next/link";
import Header from "./components/Header";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="w-64 bg-zinc-900 text-white p-4">
            <h1 className="text-lg font-semibold">Cloud Drive</h1>

              <nav className="mt-6 space-y-2">
            <Link href="/" className="block rounded px-3 py-2 hover:bg-zinc-800">
                 My Drive
            </Link>
           <Link href="/shared" className="block rounded px-3 py-2 hover:bg-zinc-800">
                 Shared
              </Link>
           <Link href="/starred" className="block rounded px-3 py-2 hover:bg-zinc-800">
                Starred
            </Link>
           <Link href="/trash" className="block rounded px-3 py-2 hover:bg-zinc-800">
                Trash
             </Link>
             </nav>

            </aside>

          {/* Main Content */}
          <main className="flex-1 bg-zinc-50 overflow-y-auto">
                 
            <div className="p-6">{children}</div>
             </main>

        </div>
      </body>
    </html>
  );
}
