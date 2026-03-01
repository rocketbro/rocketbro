import Link from "next/link";
import type { OpenLoomFileSummary } from "@/lib/openloom/types";

interface LoomCardProps {
  loom: OpenLoomFileSummary;
}

export function LoomCard({ loom }: LoomCardProps) {
  return (
    <Link href={`/looms/${loom.slug}`} className="block h-full">
      <article className="group h-full rounded-xl border border-border dark:border-border-dark p-6 hover:border-accent dark:hover:border-accent-dark transition-colors">
        <h2 className="text-3xl font-bold mb-2 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">
          {loom.title}
        </h2>

        {loom.description && (
          <p className="text-xl opacity-80 mb-5 line-clamp-3">{loom.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm font-mono opacity-70">
          <span>{loom.nodeCount} nodes</span>
          <span>•</span>
          <span>{loom.bookmarkCount} bookmarks</span>
        </div>
      </article>
    </Link>
  );
}
