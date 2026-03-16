import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-[#3b82f6]/5 blur-[80px]" />
        </div>
        <h1 className="relative text-8xl font-extrabold text-[#3b82f6]/80 sm:text-9xl">404</h1>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">Page Not Found</h2>
      <p className="mt-2 max-w-md text-slate-400">
        The page you are looking for does not exist or has been moved. Try
        searching for salaries, jobs, or countries below.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/search"
          className="rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          Search Salaries
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Go Home
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/jobs"
          className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 transition-colors hover:bg-white/10"
        >
          Browse Jobs
        </Link>
        <Link
          href="/countries"
          className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 transition-colors hover:bg-white/10"
        >
          Browse Countries
        </Link>
        <Link
          href="/map"
          className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 transition-colors hover:bg-white/10"
        >
          Salary Map
        </Link>
      </div>
    </div>
  );
}
