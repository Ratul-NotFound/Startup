import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-zinc-400 text-sm max-w-md mb-6">
        The page or subscription tier you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-white text-zinc-950 font-black text-xs hover:bg-zinc-100 transition-all shadow-lg"
      >
        Return to Storefront
      </Link>
    </div>
  );
}
