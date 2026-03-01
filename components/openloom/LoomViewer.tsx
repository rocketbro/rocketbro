"use client";

import { useEffect, useMemo, useState } from "react";
import type { OpenLoomTree } from "@/lib/openloom/types";
import {
  applyNodeToBranch,
  buildInitialBranchSelection,
  getBookmarkedNodes,
  getContinuationCount,
  traceActiveBranch,
  type BranchSelectionMap,
} from "@/lib/openloom/traversal";
import { LoomNode } from "@/components/openloom/LoomNode";
import { ContinuationRail } from "@/components/openloom/ContinuationRail";

interface LoomViewerProps {
  tree: OpenLoomTree;
}

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export function LoomViewer({ tree }: LoomViewerProps) {
  const [selection, setSelection] = useState<BranchSelectionMap>(() =>
    buildInitialBranchSelection(tree),
  );
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, []);

  const activePath = useMemo(
    () => traceActiveBranch(tree, selection),
    [tree, selection],
  );
  const activeLeafId = activePath[activePath.length - 1];
  const bookmarkedNodes = useMemo(() => getBookmarkedNodes(tree), [tree]);
  const contextMenuContinuationCount = contextMenu
    ? getContinuationCount(tree.nodes[contextMenu.nodeId] ?? { id: "", author: "", text: "" })
    : 0;

  const toggleContinuations = (nodeId: string) => {
    const continuationCount = getContinuationCount(
      tree.nodes[nodeId] ?? { id: "", author: "", text: "" },
    );
    if (continuationCount <= 1) {
      return;
    }

    setExpandedNodeId((previous) => (previous === nodeId ? null : nodeId));
    setContextMenu(null);
  };

  const switchToContinuation = (parentId: string, childId: string) => {
    const currentScrollY = window.scrollY;

    setSelection((previous) => ({
      ...previous,
      [parentId]: childId,
    }));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollY });
      });
    });
  };

  const jumpToBookmark = (nodeId: string) => {
    setSelection((previous) => applyNodeToBranch(tree, previous, nodeId));
    setContextMenu(null);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById(`loom-node-${nodeId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  };

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-border/70 dark:border-border-dark/70 p-4">
        <button
          type="button"
          onClick={() => setShowBookmarks((previous) => !previous)}
          className="text-lg font-mono opacity-80 hover:opacity-100 transition-opacity"
        >
          Bookmarks ({bookmarkedNodes.length})
        </button>

        {showBookmarks && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {bookmarkedNodes.map((bookmark) => (
              <button
                key={bookmark.id}
                type="button"
                onClick={() => jumpToBookmark(bookmark.id)}
                className="rounded-lg border border-border/70 dark:border-border-dark/70 p-3 text-left hover:border-accent dark:hover:border-accent-dark transition-colors"
              >
                <p className="font-bold text-lg">{bookmark.title}</p>
                <p className="text-sm opacity-70 mt-1 line-clamp-2">{bookmark.preview}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {activePath.map((nodeId) => {
          const node = tree.nodes[nodeId];
          if (!node) {
            return null;
          }

          const continuationCount = getContinuationCount(node);

          return (
            <div key={node.id}>
              <LoomNode
                node={node}
                isLeaf={node.id === activeLeafId}
                continuationCount={continuationCount}
                onOpenContinuations={() => toggleContinuations(node.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setContextMenu({
                    nodeId: node.id,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
              />

              {expandedNodeId === node.id && continuationCount > 1 && (
                <ContinuationRail
                  tree={tree}
                  parentNodeId={node.id}
                  continuationIds={node.childrenIds ?? []}
                  selection={selection}
                  selectedChildId={selection[node.id] ?? node.rememberedChildId ?? undefined}
                  onSelect={(childId) => switchToContinuation(node.id, childId)}
                />
              )}
            </div>
          );
        })}
      </div>

      {contextMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
          <div
            className="absolute rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark shadow-xl p-2"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              disabled={contextMenuContinuationCount <= 1}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted dark:hover:bg-muted-dark disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => toggleContinuations(contextMenu.nodeId)}
            >
              View continuations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
