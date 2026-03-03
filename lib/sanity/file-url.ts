interface BuildFileUrlOptions {
  projectId?: string | null;
  dataset?: string | null;
}

export function buildSanityFileUrlFromRef(
  ref: string | null | undefined,
  options: BuildFileUrlOptions = {},
): string | null {
  if (!ref || !ref.startsWith("file-")) {
    return null;
  }

  const projectId = options.projectId ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = options.dataset ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  if (!projectId || !dataset) {
    return null;
  }

  const parts = ref.split("-");
  if (parts.length < 3 || parts[0] !== "file") {
    return null;
  }

  const extension = parts.at(-1);
  const assetId = parts.slice(1, -1).join("-");

  if (!extension || !assetId) {
    return null;
  }

  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${extension}`;
}
