"use client";

import type { OpenLoomNode } from "@/lib/openloom/types";

interface LoomNodeProps {
  node: OpenLoomNode;
  isLeaf: boolean;
  continuationCount: number;
  onOpenContinuations: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

function isUserNode(author: string) {
  return author.toLowerCase() === "user";
}

export function LoomNode({
  node,
  isLeaf,
  continuationCount,
  onOpenContinuations,
  onContextMenu,
}: LoomNodeProps) {
  const isUser = isUserNode(node.author || "assistant");

  return (
    <section
      id={`loom-node-${node.id}`}
      className="py-5 border-b border-border/60 dark:border-border-dark/60"
      onContextMenu={onContextMenu}
    >
      <div className={isUser ? "flex justify-end" : "w-full"}>
        <article
          className={isUser
            ? "max-w-3xl rounded-3xl bg-muted/50 dark:bg-white/10 px-5 py-4"
            : "w-full"}
        >
          <p
            className={isUser ? "text-3xl leading-relaxed whitespace-pre-wrap break-words" : "text-4xl leading-relaxed whitespace-pre-wrap break-words"}
          >
            {node.text}
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm opacity-70 font-mono">
            <span>{node.author}</span>
            {node.modelId && (
              <>
                <span>•</span>
                <span>{node.modelId}</span>
              </>
            )}
            {node.isBookmarked && (
              <>
                <span>•</span>
                <span>bookmarked</span>
              </>
            )}
            {isLeaf && (
              <>
                <span>•</span>
                <span className="text-accent dark:text-accent-dark">current leaf</span>
              </>
            )}
          </div>
        </article>
      </div>

      {continuationCount > 0 && (
        <div className={isUser ? "mt-4 flex justify-end" : "mt-4"}>
          <button
            type="button"
            onClick={onOpenContinuations}
            className="text-2xl italic opacity-75 hover:opacity-100 transition-opacity"
          >
            Continuations: {continuationCount}
          </button>
        </div>
      )}
    </section>
  );
}
