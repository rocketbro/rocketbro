import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { sanityFetch } from "@/lib/sanity/server-client";
import {
  ALL_LOOM_SLUGS_QUERY,
  LOOM_BY_SLUG_QUERY,
  LOOMS_QUERY,
} from "@/lib/sanity/queries";
import type {
  ALL_LOOM_SLUGS_QUERY_RESULT,
  LOOM_BY_SLUG_QUERY_RESULT,
  LOOMS_QUERY_RESULT,
} from "@/lib/sanity/types";
import type {
  OpenLoomFileData,
  OpenLoomFileSummary,
  OpenLoomTree,
} from "@/lib/openloom/types";

const OPENLOOM_DIR = path.join(process.cwd(), "lib", "openloom");
const OPENLOOM_EXT = ".openloom.json";

function parseTree(value: unknown, source: string): OpenLoomTree {
  if (!value || typeof value !== "object") {
    throw new Error(`Invalid OpenLoom JSON in ${source}: expected object`);
  }

  const candidate = value as Partial<OpenLoomTree>;
  if (!candidate.nodes || typeof candidate.nodes !== "object") {
    throw new Error(`Invalid OpenLoom JSON in ${source}: missing nodes`);
  }

  if (!candidate.rootNodeId || typeof candidate.rootNodeId !== "string") {
    throw new Error(`Invalid OpenLoom JSON in ${source}: missing rootNodeId`);
  }

  const rootNode = (candidate.nodes as Record<string, unknown>)[candidate.rootNodeId];
  if (!rootNode) {
    throw new Error(`Invalid OpenLoom JSON in ${source}: root node not found`);
  }

  return candidate as OpenLoomTree;
}

function fileNameToSlug(fileName: string) {
  return fileName.replace(/\.openloom\.json$/i, "").toLowerCase();
}

function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.openloom\.json$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function createBookmarkCount(tree: OpenLoomTree) {
  const explicitBookmarks = Object.keys(tree.bookmarkedNodes ?? {}).length;
  if (explicitBookmarks > 0) {
    return explicitBookmarks;
  }

  return Object.values(tree.nodes).filter((node) => node.isBookmarked).length;
}

function toEpochMilliseconds(value?: string | number) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? undefined : timestamp;
  }

  return undefined;
}

function firstNonEmptyText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

async function fetchTreeFromUrl(url: string, sourceLabel: string): Promise<OpenLoomTree> {
  const response = await fetch(url, {
    cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
    next: {
      tags: ["loom"],
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenLoom JSON (${response.status}) from ${sourceLabel}`);
  }

  const data = (await response.json()) as unknown;
  return parseTree(data, sourceLabel);
}

async function readTreeFromFile(fileName: string): Promise<OpenLoomTree> {
  const filePath = path.join(OPENLOOM_DIR, fileName);
  const fileContent = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(fileContent) as unknown;
  return parseTree(parsed, fileName);
}

async function listLocalOpenLoomSummaries(): Promise<OpenLoomFileSummary[]> {
  const files = await fs.readdir(OPENLOOM_DIR);
  const openLoomFiles = files.filter((file) => file.toLowerCase().endsWith(OPENLOOM_EXT));

  const summaries = await Promise.all(
    openLoomFiles.map(async (fileName) => {
      const tree = await readTreeFromFile(fileName);
      const nodeCount = Object.keys(tree.nodes).length;
      const bookmarkCount = createBookmarkCount(tree);

      return {
        slug: fileNameToSlug(fileName),
        source: "local",
        fileName,
        title: tree.title || titleFromFileName(fileName),
        description: tree.description,
        nodeCount,
        bookmarkCount,
        currentNodeId: tree.currentNodeId,
        rootNodeId: tree.rootNodeId,
        lastModified: tree.lastModified,
      } satisfies OpenLoomFileSummary;
    }),
  );

  return summaries;
}

async function listSanityOpenLoomSummaries(): Promise<OpenLoomFileSummary[]> {
  const loomDocs = await sanityFetch<LOOMS_QUERY_RESULT>({
    query: LOOMS_QUERY,
    tags: ["loom"],
  });

  if (!loomDocs || loomDocs.length === 0) {
    return [];
  }

  const mapped = await Promise.all(
    loomDocs.map(async (doc) => {
      const fileUrl = doc.openLoomFile?.asset?.url;
      const fileName = doc.openLoomFile?.asset?.originalFilename || `${doc.slug?.current || doc._id}.openloom.json`;
      if (!fileUrl || !doc.slug?.current) {
        return null;
      }

      try {
        const tree = await fetchTreeFromUrl(fileUrl, `sanity:${doc.slug.current}`);

        return {
          slug: doc.slug.current,
          source: "sanity",
          fileName,
          title: firstNonEmptyText(doc.title, tree.title, titleFromFileName(fileName)) || "Untitled Loom",
          description: firstNonEmptyText(doc.description, tree.description),
          nodeCount: Object.keys(tree.nodes).length,
          bookmarkCount: createBookmarkCount(tree),
          currentNodeId: tree.currentNodeId,
          rootNodeId: tree.rootNodeId,
          lastModified: tree.lastModified || toEpochMilliseconds(doc._updatedAt),
        } satisfies OpenLoomFileSummary;
      } catch (error) {
        console.error(
          `Failed to parse Sanity loom document ${doc._id}:`,
          error instanceof Error ? error.message : "Unknown error",
        );
        return null;
      }
    }),
  );

  const summaries: OpenLoomFileSummary[] = [];
  for (const entry of mapped) {
    if (entry) {
      summaries.push(entry);
    }
  }

  return summaries;
}

async function getLocalOpenLoomBySlug(slug: string): Promise<OpenLoomFileData | null> {
  const files = await fs.readdir(OPENLOOM_DIR);
  const fileName = files.find((file) => fileNameToSlug(file) === slug.toLowerCase());

  if (!fileName) {
    return null;
  }

  const tree = await readTreeFromFile(fileName);

  return {
    slug: fileNameToSlug(fileName),
    source: "local",
    fileName,
    tree,
  };
}

async function getSanityOpenLoomBySlug(slug: string): Promise<OpenLoomFileData | null> {
  const doc = await sanityFetch<LOOM_BY_SLUG_QUERY_RESULT>({
    query: LOOM_BY_SLUG_QUERY,
    params: { slug },
    tags: ["loom", `loom:${slug}`],
  });

  if (!doc || !doc.slug?.current || !doc.openLoomFile?.asset?.url) {
    return null;
  }

  try {
    const tree = await fetchTreeFromUrl(doc.openLoomFile.asset.url, `sanity:${doc.slug.current}`);

    return {
      slug: doc.slug.current,
      source: "sanity",
      fileName: doc.openLoomFile.asset.originalFilename || `${doc.slug.current}.openloom.json`,
      tree: {
        ...tree,
        title: firstNonEmptyText(doc.title, tree.title) || "Untitled Loom",
        description: firstNonEmptyText(doc.description, tree.description),
        lastModified: tree.lastModified || toEpochMilliseconds(doc._updatedAt),
      },
    };
  } catch (error) {
    console.error(
      `Failed to parse Sanity loom by slug ${slug}:`,
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}

export async function listOpenLoomSummaries(): Promise<OpenLoomFileSummary[]> {
  const [local, sanity] = await Promise.all([
    listLocalOpenLoomSummaries().catch(() => []),
    listSanityOpenLoomSummaries().catch(() => []),
  ]);

  const merged = new Map<string, OpenLoomFileSummary>();

  for (const entry of local) {
    merged.set(entry.slug, entry);
  }

  for (const entry of sanity) {
    merged.set(entry.slug, entry);
  }

  return Array.from(merged.values()).sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));
}

export async function listSanityLoomSlugs(): Promise<string[]> {
  const slugs = await sanityFetch<ALL_LOOM_SLUGS_QUERY_RESULT>({
    query: ALL_LOOM_SLUGS_QUERY,
    tags: ["loom"],
  });

  return (slugs ?? []).map((entry) => entry.slug).filter((slug): slug is string => Boolean(slug));
}

export async function getOpenLoomBySlug(slug: string): Promise<OpenLoomFileData | null> {
  const sanityLoom = await getSanityOpenLoomBySlug(slug);
  if (sanityLoom) {
    return sanityLoom;
  }

  return getLocalOpenLoomBySlug(slug);
}
