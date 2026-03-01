"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import type { OpenLoomNode } from "@/lib/openloom/types";
import { LoomNodeContent } from "@/components/openloom/LoomNodeContent";

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
  const [copied, setCopied] = useState(false);
  const isUser = isUserNode(node.author || "assistant");

  const copyNodeText = async () => {
    try {
      await navigator.clipboard.writeText(node.text || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id={`loom-node-${node.id}`}
      className="py-5"
      onContextMenu={onContextMenu}
    >
      <div className={isUser ? "flex justify-end" : "w-full"}>
        <article
          className={isUser
            ? "max-w-3xl rounded-3xl bg-muted/50 dark:bg-white/10 px-5 py-4"
            : "w-full"}
        >
          <LoomNodeContent text={node.text} />

          <div className="mt-4 flex items-center gap-2 text-sm opacity-70 font-mono flex-wrap">
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

          <div className="mt-2">
            <button
              type="button"
              onClick={copyNodeText}
              className="inline-flex items-center gap-2 text-sm font-mono opacity-75 hover:opacity-100 transition-opacity"
            >
              {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </article>
      </div>

      {continuationCount > 1 && (
        <div className={isUser ? "mt-4 flex justify-end" : "mt-4"}>
          <button
            type="button"
            onClick={onOpenContinuations}
            className="text-xl md:text-2xl italic opacity-75 hover:opacity-100 transition-opacity"
          >
            Continuations: {continuationCount}
          </button>
        </div>
      )}
    </section>
  );
}
