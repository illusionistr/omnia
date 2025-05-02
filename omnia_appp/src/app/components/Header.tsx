import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-blue-200 to-purple-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/omnia.svg"
                alt="Omnia Logo"
                width={280}
                height={120}
                className="h-20 w-auto"
              />
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link
              href="/movies"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/tv-shows"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              TV Shows
            </Link>
            <Link
              href="/video-games"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Video Games
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 