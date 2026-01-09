import FileGrid from "./components/FileGrid";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-600">My Drive</h1>

      <p className="mt-2 text-zinc-600">
        Your files and folders will appear here.
      </p>

      <FileGrid/>
      
    </div>
  );
}

