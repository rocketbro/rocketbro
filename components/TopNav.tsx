import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface TopNavProps {
  siteTitle?: string;
}

export function TopNav({ siteTitle = "Rocketbro" }: TopNavProps) {
  return (
    <header className="border-b border-border dark:border-border-dark fixed top-0 left-0 right-0 bg-background dark:bg-background-dark z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 md:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-accent dark:hover:text-accent-dark transition-colors"
        >
          {siteTitle}
        </Link>
        <div className="flex gap-6 items-center">
          <nav className="flex gap-6">
            <Link
              href="/"
              className="text-lg hover:text-accent dark:hover:text-accent-dark transition-colors"
            >
              blog
            </Link>
            <Link
              href="/links"
              className="text-lg hover:text-accent dark:hover:text-accent-dark transition-colors"
            >
              links
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
