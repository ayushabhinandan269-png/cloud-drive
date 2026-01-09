type Folder = {
  id: string;
  name: string;
};

type FileItem = {
  id: string;
  name: string;
  size: string;
};

const folders: Folder[] = [
  { id: "1", name: "Projects" },
  { id: "2", name: "Documents" },
  { id: "3", name: "Photos" },
];

const files: FileItem[] = [
  { id: "1", name: "resume.pdf", size: "240 KB" },
  { id: "2", name: "design.png", size: "1.2 MB" },
];

export default function FileGrid() {
  return (
    <div className="mt-6 space-y-6">
      {/* Folders */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-600">Folders</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="cursor-pointer rounded-lg border bg-white p-4 text-black hover:shadow"
            >
              📁 {folder.name}
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-600">Files</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="cursor-pointer rounded-lg border bg-white p-4 text-black hover:shadow"
            >
              <div className="font-medium">{file.name}</div>
              <div className="mt-1 text-xs text-zinc-500">{file.size}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
