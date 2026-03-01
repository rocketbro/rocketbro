export interface OpenLoomNode {
  id: string;
  author: string;
  text: string;
  childrenIds?: string[];
  parentId?: string | null;
  rememberedChildId?: string | null;
  createdTime?: number;
  modelId?: string;
  isBookmarked?: boolean;
  bookmarkTitle?: string;
}

export interface OpenLoomTree {
  id?: string;
  title: string;
  description?: string;
  systemMessage?: string;
  rootNodeId: string;
  currentNodeId?: string;
  lastModified?: number;
  nodes: Record<string, OpenLoomNode>;
  bookmarkedNodes?: Record<string, OpenLoomNode>;
}

export interface OpenLoomFileSummary {
  slug: string;
  fileName: string;
  title: string;
  description?: string;
  nodeCount: number;
  bookmarkCount: number;
  currentNodeId?: string;
  rootNodeId: string;
  lastModified?: number;
}

export interface OpenLoomFileData {
  slug: string;
  fileName: string;
  tree: OpenLoomTree;
}

export interface BookmarkedNodeSummary {
  id: string;
  title: string;
  preview: string;
  createdTime?: number;
}
