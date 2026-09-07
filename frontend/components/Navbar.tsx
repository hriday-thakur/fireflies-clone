import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/meetings" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-semibold text-lg">Fireflies Clone</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/meetings" className="hover:text-brand">
            Meetings
          </Link>
          <span className="cursor-not-allowed text-gray-400" title="Coming soon">
            Integrations
          </span>
          <span className="cursor-not-allowed text-gray-400" title="Coming soon">
            Team
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-500 hover:text-brand" title="Coming soon">
            Settings
          </button>
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand flex items-center justify-center font-semibold text-sm">
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
