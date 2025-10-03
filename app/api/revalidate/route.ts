import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

// Verify Sanity webhook signature
function isValidSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  try {
    // Sanity signature format: "t=timestamp,v1=hash"
    const signatureParts = signature.split(",");
    const timestamp = signatureParts
      .find((part) => part.startsWith("t="))
      ?.split("=")[1];
    const hash = signatureParts
      .find((part) => part.startsWith("v1="))
      ?.split("=")[1];

    if (!timestamp || !hash) {
      console.log("❌ Invalid signature format");
      return false;
    }

    // Create HMAC signature
    const signaturePayload = `${timestamp}.${body}`;
    const expectedHash = createHmac("sha256", secret)
      .update(signaturePayload)
      .digest("base64");

    // Compare signatures
    const isValid = hash === expectedHash;
    console.log(
      "🔐 Signature validation:",
      isValid ? "✅ Valid" : "❌ Invalid",
    );

    return isValid;
  } catch (err) {
    console.error("❌ Error validating signature:", err);
    return false;
  }
}

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

    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("sanity-webhook-signature");

    console.log("🔑 Signature present:", !!signature);
    console.log(
      "🔐 Secret configured:",
      !!process.env.SANITY_REVALIDATE_SECRET,
    );

    // Verify signature if secret is configured
    if (process.env.SANITY_REVALIDATE_SECRET) {
      if (!signature) {
        console.log("❌ No signature provided");
        return NextResponse.json(
          { message: "Missing signature" },
          { status: 401 },
        );
      }

      const isValid = isValidSignature(
        body,
        signature,
        process.env.SANITY_REVALIDATE_SECRET,
      );

      if (!isValid) {
        console.log("❌ Invalid signature - rejecting request");
        return NextResponse.json(
          { message: "Invalid signature" },
          { status: 401 },
        );
      }

      console.log("✅ Signature validated successfully");
    } else {
      console.log("⚠️  No secret configured - skipping signature validation");
    }

    // Parse the JSON body
    const payload = JSON.parse(body);
    console.log(
      "📦 Received webhook payload:",
      JSON.stringify(payload, null, 2),
    );

    // Log Sanity headers for debugging
    const sanityHeaders = {
      operation: request.headers.get("sanity-operation"),
      documentId: request.headers.get("sanity-document-id"),
      dataset: request.headers.get("sanity-dataset"),
      projectId: request.headers.get("sanity-project-id"),
    };
    console.log("📋 Sanity headers:", sanityHeaders);

    // Extract document type and slug from payload
    const _type = payload._type || payload.type;
    const slug = payload.slug || payload.data?.slug;

    console.log(`📝 Document type: ${_type || "UNKNOWN"}`);
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
