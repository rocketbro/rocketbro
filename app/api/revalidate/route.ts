import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Revalidation webhook called at:", new Date().toISOString());

    // Parse the request body
    const body = await request.json();
    console.log("📦 Received webhook payload:", JSON.stringify(body, null, 2));

    // Verify the secret token
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

    // Get the document type and slug from the webhook payload
    const { _type, slug } = body;
    console.log(`📝 Document type: ${_type}`);
    console.log(`📝 Slug: ${slug?.current || "N/A"}`);

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
        console.log(`♻️  Revalidating for unknown type "${_type}"...`);
        // For any other document type, revalidate home page
        console.log("  → Revalidating path: /");
        revalidatePath("/");
    }

    console.log("✅ Revalidation completed successfully");

    const response = {
      revalidated: true,
      now: Date.now(),
      type: _type,
      slug: slug?.current,
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
