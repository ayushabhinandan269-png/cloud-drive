"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white text-center">
      <h2 className="text-xl font-semibold text-zinc-800">
        Something went wrong
      </h2>

      <p className="text-sm text-zinc-500">
        An unexpected error occurred. Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
      >
        Retry
      </button>
    </div>
  );
}
