import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

// GET handler for testing the endpoint
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Webhook endpoint is working!",
    timestamp: new Date().toISOString(),
    ready: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Revalidation webhook called at:", new Date().toISOString());
    console.log("📍 Request URL:", request.url);
    console.log(
      "📍 Request headers:",
      Object.fromEntries(request.headers.entries()),
    );

    // Verify the secret token first
    const secret = request.nextUrl.searchParams.get("secret");
    const hasSecret = !!secret;
    const hasEnvSecret = !!process.env.SANITY_REVALIDATE_SECRET;
    console.log("🔑 Secret present in request:", hasSecret);
    console.log("🔐 Secret configured in env:", hasEnvSecret);

    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      console.log("❌ Secret mismatch - rejecting request");
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    console.log("✅ Secret validated successfully");

    // Parse the request body
    const body = await request.json();
    console.log("📦 Received webhook payload:", JSON.stringify(body, null, 2));

    // Sanity webhook payload structure - check multiple possible locations
    // The payload might be the document itself, or wrapped in different ways
    const _type = body._type || body.type;
    const slug = body.slug || body.data?.slug;

    // Log what we extracted
    console.log(`📝 Document type: ${_type || "UNKNOWN"}`);
    console.log(`📝 Slug: ${slug?.current || "N/A"}`);

    // If we don't have a _type, log the entire structure for debugging
    if (!_type) {
      console.log("⚠️  No _type found in payload. Full structure:");
      console.log("Keys:", Object.keys(body));
    }

    // Revalidate based on document type
    switch (_type) {
      case "post":
        console.log("♻️  Revalidating post-related pages...");
        // Revalidate the specific post page
        if (slug?.current) {
          console.log(`  → Revalidating path: /blog/${slug.current}`);
          revalidatePath(`/blog/${slug.current}`);
        }
        // Revalidate the home page (shows recent posts)
        console.log("  → Revalidating path: /");
        revalidatePath("/");
        // Revalidate by tag
        console.log("  → Revalidating tag: post");
        revalidateTag("post");
        if (slug?.current) {
          console.log(`  → Revalidating tag: post:${slug.current}`);
          revalidateTag(`post:${slug.current}`);
        }
        break;

      case "settings":
        console.log("♻️  Revalidating settings (all pages)...");
        // Revalidate all pages when settings change
        console.log("  → Revalidating path: / (layout)");
        revalidatePath("/", "layout");
        console.log("  → Revalidating tag: settings");
        revalidateTag("settings");
        break;

      case "author":
        console.log("♻️  Revalidating author-related content...");
        // Revalidate all posts that might reference this author
        console.log("  → Revalidating path: /");
        revalidatePath("/");
        console.log("  → Revalidating tag: post");
        revalidateTag("post");
        break;

      case "category":
        console.log("♻️  Revalidating category-related content...");
        // Revalidate all posts that might reference this category
        console.log("  → Revalidating path: /");
        revalidatePath("/");
        console.log("  → Revalidating tag: post");
        revalidateTag("post");
        break;

      default:
        console.log(
          `♻️  Revalidating for unknown type "${_type || "NONE"}"...`,
        );
        // For any other document type, revalidate home page
        console.log("  → Revalidating path: /");
        revalidatePath("/");
    }

    console.log("✅ Revalidation completed successfully");

    const response = {
      revalidated: true,
      now: Date.now(),
      timestamp: new Date().toISOString(),
      type: _type || "unknown",
      slug: slug?.current || null,
      receivedKeys: Object.keys(body),
    };

    console.log(
      "📤 Sending success response:",
      JSON.stringify(response, null, 2),
    );

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("❌ Error during revalidation:", err);
    console.error(
      "❌ Error stack:",
      err instanceof Error ? err.stack : "No stack trace",
    );
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 },
    );
  }
}
