import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

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

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Revalidation webhook called at:", new Date().toISOString());

    // Use parseBody from next-sanity to validate signature and parse body
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: string | undefined;
    }>(req, process.env.SANITY_REVALIDATE_SECRET);

    console.log(
      "🔑 Signature present:",
      req.headers.has("sanity-webhook-signature"),
    );
    console.log(
      "🔐 Secret configured:",
      !!process.env.SANITY_REVALIDATE_SECRET,
    );

    // Verify signature
    if (!isValidSignature) {
      console.log("❌ Invalid signature - rejecting request");
      return new Response("Invalid signature", { status: 401 });
    }

    console.log("✅ Signature validated successfully");

    // Validate body
    if (!body?._type) {
      console.log("❌ Bad Request - missing _type");
      return new Response("Bad Request", { status: 400 });
    }

    console.log("📦 Received webhook payload:", JSON.stringify(body, null, 2));

    // Log Sanity headers for debugging
    const sanityHeaders = {
      operation: req.headers.get("sanity-operation"),
      documentId: req.headers.get("sanity-document-id"),
      dataset: req.headers.get("sanity-dataset"),
      projectId: req.headers.get("sanity-project-id"),
    };
    console.log("📋 Sanity headers:", sanityHeaders);

    // Extract document type and slug from payload
    const _type = body._type;
    const slug = body.slug;

    console.log(`📝 Document type: ${_type}`);
    console.log(`📝 Slug: ${slug || "N/A"}`);

    // Revalidate based on document type using revalidateTag
    switch (_type) {
      case "post":
        console.log("♻️  Revalidating post-related content...");
        console.log("  → Revalidating tag: post");
        revalidateTag("post");
        break;

      case "settings":
        console.log("♻️  Revalidating settings...");
        console.log("  → Revalidating tag: settings");
        revalidateTag("settings");
        break;

      case "author":
        console.log("♻️  Revalidating author-related content...");
        console.log("  → Revalidating tag: author");
        revalidateTag("author");
        break;

      case "category":
        console.log("♻️  Revalidating category-related content...");
        console.log("  → Revalidating tag: category");
        revalidateTag("category");
        break;

      default:
        console.log(`♻️  Revalidating for type "${_type}"...`);
        console.log(`  → Revalidating tag: ${_type}`);
        revalidateTag(_type);
    }

    console.log("✅ Revalidation completed successfully");

    const response = {
      revalidated: true,
      now: Date.now(),
      timestamp: new Date().toISOString(),
      type: _type,
      slug: slug || null,
    };

    console.log(
      "📤 Sending success response:",
      JSON.stringify(response, null, 2),
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error during revalidation:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return new Response(error.message, { status: 500 });
  }
}
