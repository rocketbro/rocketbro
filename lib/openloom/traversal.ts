import type {
  BookmarkedNodeSummary,
  OpenLoomNode,
  OpenLoomTree,
} from "@/lib/openloom/types";

export type BranchSelectionMap = Record<string, string>;

function isValidChild(node: OpenLoomNode | undefined, childId: string | null | undefined) {
  return !!(node && childId && node.childrenIds?.includes(childId));
}

function getSelectedChildId(
  tree: OpenLoomTree,
  nodeId: string,
  selection: BranchSelectionMap,
): string | undefined {
  const node = tree.nodes[nodeId];
  if (!node || !node.childrenIds || node.childrenIds.length === 0) {
    return undefined;
  }

  const fromSelection = selection[nodeId];
  if (isValidChild(node, fromSelection)) {
    return fromSelection;
  }

  if (isValidChild(node, node.rememberedChildId)) {
    return node.rememberedChildId as string;
  }

  return node.childrenIds[0];
}

export function buildInitialBranchSelection(tree: OpenLoomTree): BranchSelectionMap {
  const selection: BranchSelectionMap = {};

  for (const node of Object.values(tree.nodes)) {
    if (!node.childrenIds || node.childrenIds.length === 0) {
      continue;
    }

    if (isValidChild(node, node.rememberedChildId)) {
      selection[node.id] = node.rememberedChildId as string;
      continue;
    }

    selection[node.id] = node.childrenIds[0];
  }

  if (tree.currentNodeId && tree.nodes[tree.currentNodeId]) {
    return applyNodeToBranch(tree, selection, tree.currentNodeId);
  }

  return selection;
}

export function traceBranchFromNode(
  tree: OpenLoomTree,
  startNodeId: string,
  selection: BranchSelectionMap,
): string[] {
  const branch: string[] = [];
  const visited = new Set<string>();

  let currentId: string | undefined = startNodeId;

  while (currentId && !visited.has(currentId) && tree.nodes[currentId]) {
    visited.add(currentId);
    branch.push(currentId);

    const nextId = getSelectedChildId(tree, currentId, selection);
    if (!nextId) {
      break;
    }

    currentId = nextId;
  }

  return branch;
}

export function traceActiveBranch(
  tree: OpenLoomTree,
  selection: BranchSelectionMap,
): string[] {
  return traceBranchFromNode(tree, tree.rootNodeId, selection);
}

export function getContinuationCount(node: OpenLoomNode): number {
  return node.childrenIds?.length ?? 0;
}

export function getContinuationDepth(
  tree: OpenLoomTree,
  continuationId: string,
  selection: BranchSelectionMap,
): number {
  return traceBranchFromNode(tree, continuationId, selection).length;
}

export function applyNodeToBranch(
  tree: OpenLoomTree,
  selection: BranchSelectionMap,
  nodeId: string,
): BranchSelectionMap {
  if (!tree.nodes[nodeId]) {
    return selection;
  }

  const nextSelection = { ...selection };
  let currentId: string | undefined = nodeId;

  while (currentId) {
    const currentNode: OpenLoomNode | undefined = tree.nodes[currentId];
    if (!currentNode || !currentNode.parentId) {
      break;
    }

    const parent: OpenLoomNode | undefined = tree.nodes[currentNode.parentId];
    if (parent && parent.childrenIds?.includes(currentId)) {
      nextSelection[parent.id] = currentId;
    }

    currentId = parent?.id;
  }

  return nextSelection;
}

function getBookmarkTitle(id: string, node: OpenLoomNode, tree: OpenLoomTree): string {
  const fromBookmarkMap = tree.bookmarkedNodes?.[id]?.bookmarkTitle;
  if (fromBookmarkMap) return fromBookmarkMap;
  if (node.bookmarkTitle) return node.bookmarkTitle;
  return `Bookmark ${id.slice(0, 8)}`;
}

function createPreview(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 120 ? `${cleaned.slice(0, 120)}...` : cleaned;
}

export function getBookmarkedNodes(tree: OpenLoomTree): BookmarkedNodeSummary[] {
  const bookmarkIds = new Set<string>([
    ...Object.keys(tree.bookmarkedNodes ?? {}),
    ...Object.values(tree.nodes)
      .filter((node) => node.isBookmarked)
      .map((node) => node.id),
  ]);

  const summaries: BookmarkedNodeSummary[] = [];

  for (const id of bookmarkIds) {
      const node = tree.nodes[id] ?? tree.bookmarkedNodes?.[id];
      if (!node) {
        continue;
      }

      summaries.push({
        id,
        title: getBookmarkTitle(id, node, tree),
        preview: createPreview(node.text || ""),
        createdTime: node.createdTime,
      });
    }

  return summaries.sort((a, b) => (a.createdTime ?? 0) - (b.createdTime ?? 0));
}
