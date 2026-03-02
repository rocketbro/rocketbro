"use client";

import { FiBookmark } from "react-icons/fi";
import type { OpenLoomTree } from "@/lib/openloom/types";
import type { BranchSelectionMap } from "@/lib/openloom/traversal";
import { getContinuationDepth } from "@/lib/openloom/traversal";

interface ContinuationRailProps {
  tree: OpenLoomTree;
  parentNodeId: string;
  continuationIds: string[];
  selection: BranchSelectionMap;
  selectedChildId?: string;
  onSelect: (childId: string) => void;
  isClosing?: boolean;
}

function previewText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 190 ? `${cleaned.slice(0, 190)}...` : cleaned;
}

export function ContinuationRail({
  tree,
  parentNodeId,
  continuationIds,
  selection,
  selectedChildId,
  onSelect,
  isClosing = false,
}: ContinuationRailProps) {
  return (
    <div
      data-continuation-rail-for={parentNodeId}
      className={`mt-3 rounded-2xl border border-border/70 dark:border-border-dark/70 p-4 transform-gpu ${
        isClosing ? "loom-rail-exit" : "loom-rail-enter"
      }`}
    >
      <div className="mb-3 text-sm font-mono opacity-70">
        Continuations from node: {parentNodeId.slice(0, 8)}
      </div>

      <div className="flex items-start gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {continuationIds.map((childId) => {
          const child = tree.nodes[childId];
          if (!child) {
            return null;
          }

          const isCurrent = childId === selectedChildId;
          const depth = getContinuationDepth(tree, childId, selection);

          return (
            <button
              key={childId}
              type="button"
              onClick={() => onSelect(childId)}
              className={`snap-start w-[300px] flex-shrink-0 rounded-xl border p-4 text-left transition-all ${
                isCurrent
                  ? "border-[#85c786] bg-[#ceb897] text-black"
                  : "border-border dark:border-border-dark bg-[#c7b393] text-black hover:-translate-y-0.5"
              }`}
            >
              <div className="mb-3 flex flex-col gap-2 text-sm font-mono">
                <div className="opacity-80 whitespace-normal break-all leading-snug">
                  {child.modelId || child.author}
                </div>
                <div className="flex items-center gap-2">
                  {isCurrent && <span className="text-[#2f6d3b]">●</span>}
                  {child.isBookmarked && <FiBookmark className="h-4 w-4" />}
                  <span>[{depth}]</span>
                </div>
              </div>

              <p className="text-xl leading-relaxed">{previewText(child.text || "")}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
