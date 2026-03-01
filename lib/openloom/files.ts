import "server-only";

import { promises as fs } from "fs";
import path from "path";
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

async function readTreeFromFile(fileName: string): Promise<OpenLoomTree> {
  const filePath = path.join(OPENLOOM_DIR, fileName);
  const fileContent = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(fileContent) as unknown;
  return parseTree(parsed, fileName);
}

export async function listOpenLoomSummaries(): Promise<OpenLoomFileSummary[]> {
  const files = await fs.readdir(OPENLOOM_DIR);
  const openLoomFiles = files.filter((file) => file.toLowerCase().endsWith(OPENLOOM_EXT));

  const summaries = await Promise.all(
    openLoomFiles.map(async (fileName) => {
      const tree = await readTreeFromFile(fileName);
      const nodeCount = Object.keys(tree.nodes).length;
      const bookmarkCount = Object.keys(tree.bookmarkedNodes ?? {}).length;

      return {
        slug: fileNameToSlug(fileName),
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

  return summaries.sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));
}

export async function getOpenLoomBySlug(slug: string): Promise<OpenLoomFileData | null> {
  const files = await fs.readdir(OPENLOOM_DIR);
  const fileName = files.find((file) => fileNameToSlug(file) === slug.toLowerCase());

  if (!fileName) {
    return null;
  }

  const tree = await readTreeFromFile(fileName);

  return {
    slug: fileNameToSlug(fileName),
    fileName,
    tree,
  };
}
