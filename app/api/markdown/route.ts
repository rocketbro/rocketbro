import { NextRequest, NextResponse } from "next/server";

const SANITY_FILE_HOST = "cdn.sanity.io";

function isAllowedSanityFileUrl(url: URL) {
  if (url.protocol !== "https:" || url.hostname !== SANITY_FILE_HOST) {
    return false;
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  if (projectId) {
    return url.pathname.startsWith(`/files/${projectId}/${dataset}/`);
  }

  return url.pathname.startsWith("/files/");
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing markdown file URL." }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid markdown file URL." }, { status: 400 });
  }

  if (!isAllowedSanityFileUrl(targetUrl)) {
    return NextResponse.json({ error: "URL is not an allowed Sanity file URL." }, { status: 400 });
  }

  const upstreamResponse = await fetch(targetUrl.toString(), { cache: "no-store" });
  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { error: `Unable to load markdown file (${upstreamResponse.status}).` },
      { status: upstreamResponse.status },
    );
  }

  const markdownText = await upstreamResponse.text();
  return new NextResponse(markdownText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
