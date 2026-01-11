import { supabase } from "../lib/supabaseClient";

export default async function Home() {

  const { data: folders } = await supabase
    .from("folders")
    .select("*");

  const { data: files } = await supabase
    .from("files")
    .select("*");

  return (
    <div>

      <h1 className="text-2xl font-semibold text-blue-600">
        My Drive
      </h1>

      <p className="mt-2 text-zinc-600">
        Your files and folders will appear here.
      </p>

      {/* FOLDERS SECTION */}
      <div className="mt-6">

        <h2 className="text-sm font-medium text-zinc-700">
          Folders
        </h2>

        <div className="mt-2 grid grid-cols-3 gap-4">
          {folders?.map((folder) => (
            <div
              key={folder.id}
              className="rounded-lg border bg-white p-4 text-black
                         hover:shadow-md hover:border-zinc-400
                         transition cursor-pointer"
            >
              <span className="font-medium">
                📁 {folder.name}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* FILES SECTION */}
      <div className="mt-8">

        <h2 className="text-sm font-medium text-zinc-700">
          Files
        </h2>

        <div className="mt-2 grid grid-cols-3 gap-4">
          {files?.map((file) => (
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
  );
}

