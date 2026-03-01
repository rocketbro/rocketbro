"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiBookmark, FiCheck, FiCopy } from "react-icons/fi";
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

const RAIL_EXIT_MS = 170;
const COPY_FEEDBACK_MS = 1500;

function toSpeakerLabel(author: string | undefined) {
  return author?.toLowerCase() === "user" ? "user" : "assistant";
}

function buildCurrentPathText(tree: OpenLoomTree, activePath: string[]) {
  const lines: string[] = [];

  if (tree.title) {
    lines.push(`Title: ${tree.title}`);
  }

  if (tree.description) {
    lines.push(`Description: ${tree.description}`);
  }

  if (tree.title || tree.description) {
    lines.push("");
  }

  for (const nodeId of activePath) {
    const node = tree.nodes[nodeId];
    if (!node) {
      continue;
    }

    lines.push(`${toSpeakerLabel(node.author)}:`);
    lines.push((node.text || "").trim());
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function LoomViewer({ tree }: LoomViewerProps) {
  const [selection, setSelection] = useState<BranchSelectionMap>(() =>
    buildInitialBranchSelection(tree),
  );
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [closingNodeId, setClosingNodeId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const activePath = useMemo(
    () => traceActiveBranch(tree, selection),
    [tree, selection],
  );
  const bookmarkedNodes = useMemo(() => getBookmarkedNodes(tree), [tree]);
  const contextMenuContinuationCount = contextMenu
    ? getContinuationCount(tree.nodes[contextMenu.nodeId] ?? { id: "", author: "", text: "" })
    : 0;

  const closeContinuations = useCallback(() => {
    if (!expandedNodeId) {
      return;
    }

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const nodeIdToClose = expandedNodeId;
    setClosingNodeId(nodeIdToClose);
    closeTimeoutRef.current = window.setTimeout(() => {
      setExpandedNodeId(null);
      setClosingNodeId(null);
      closeTimeoutRef.current = null;
    }, RAIL_EXIT_MS);
  }, [expandedNodeId]);

  const copyCurrentPath = async () => {
    try {
      await navigator.clipboard.writeText(buildCurrentPathText(tree, activePath));
      setPathCopied(true);

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setPathCopied(false);
        copyTimeoutRef.current = null;
      }, COPY_FEEDBACK_MS);
    } catch {
      setPathCopied(false);
    }
  };

  const toggleContinuations = (nodeId: string) => {
    const continuationCount = getContinuationCount(
      tree.nodes[nodeId] ?? { id: "", author: "", text: "" },
    );
    if (continuationCount <= 1) {
      return;
    }

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (expandedNodeId === nodeId) {
      closeContinuations();
      setContextMenu(null);
      return;
    }

    setClosingNodeId(null);
    setExpandedNodeId(nodeId);
    setContextMenu(null);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!expandedNodeId) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest(`[data-continuation-rail-for="${expandedNodeId}"]`)) {
        return;
      }

      if (target.closest(`[data-continuation-toggle-for="${expandedNodeId}"]`)) {
        return;
      }

      closeContinuations();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeContinuations, expandedNodeId]);

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
      <div className="mb-4">
        <button
          type="button"
          onClick={copyCurrentPath}
          className="inline-flex items-center rounded-full border border-primary px-4 gap-2 text-primary dark:text-primary-dark hover:text-accent dark:hover:text-accent-dark transition-colors font-cascadia"
        >
          {pathCopied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
          <span>{pathCopied ? "Copied current path" : "Copy current path"}</span>
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-border/70 dark:border-border-dark/70 p-4">
        <button
          type="button"
          onClick={() => setShowBookmarks((previous) => !previous)}
          className="inline-flex items-center gap-2 text-lg font-mono opacity-80 hover:opacity-100 transition-opacity"
        >
          <FiBookmark className="h-4 w-4" />
          <span>Bookmarks ({bookmarkedNodes.length})</span>
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
                continuationCount={continuationCount}
                isContinuationsOpen={expandedNodeId === node.id}
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
                  isClosing={closingNodeId === node.id}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={copyCurrentPath}
          className="inline-flex items-center rounded-full border border-primary px-4 gap-2 text-primary dark:text-primary-dark hover:text-accent dark:hover:text-accent-dark transition-colors font-cascadia"
        >
          {pathCopied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
          <span>{pathCopied ? "Copied current path" : "Copy current path"}</span>
        </button>
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
