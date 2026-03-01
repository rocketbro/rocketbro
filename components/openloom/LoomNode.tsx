"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import type { OpenLoomNode } from "@/lib/openloom/types";
import { LoomNodeContent } from "@/components/openloom/LoomNodeContent";

interface LoomNodeProps {
  node: OpenLoomNode;
  continuationCount: number;
  onOpenContinuations: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

function isUserNode(author: string) {
  return author.toLowerCase() === "user";
}

export function LoomNode({
  node,
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
            ? "w-full max-w-2xl rounded-3xl bg-black/[0.06] dark:bg-white/10 px-5 py-4"
            : "w-full"}
        >
          <LoomNodeContent text={node.text} />

          <div className="mt-4 flex items-center gap-2 text-sm font-mono opacity-75">
            <button
              type="button"
              onClick={copyNodeText}
              className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
            >
              {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {continuationCount > 1 && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenContinuations}
                  className="px-2 hover:opacity-100 transition-opacity"
                >
                  Continuations: {continuationCount}
                </button>
              </>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
