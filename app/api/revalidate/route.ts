import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    secretConfigured: !!process.env.NEXT_PUBLIC_SANITY_WEBHOOK_SECRET,
  });
}

export async function POST(req: NextRequest) {
  console.log("=== REVALIDATION WEBHOOK RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("URL:", req.url);
  console.log("Method:", req.method);

  try {
    // Log environment variable status
    const envSecret = process.env.NEXT_PUBLIC_SANITY_WEBHOOK_SECRET;
    console.log("\n--- SECRET CONFIGURATION ---");
    console.log("Environment variable exists:", !!envSecret);
    console.log("Environment variable length:", envSecret?.length || 0);
    console.log("Environment variable value:", envSecret || "NOT SET");

    // Log all relevant headers
    console.log("\n--- REQUEST HEADERS ---");
    const relevantHeaders = [
      "content-type",
      "sanity-webhook-signature",
      "user-agent",
      "x-sanity-webhook-signature",
    ];
    relevantHeaders.forEach((headerName) => {
      const value = req.headers.get(headerName);
      console.log(`${headerName}:`, value || "NOT PRESENT");
    });

    // Log all headers (for debugging)
    console.log("\n--- ALL HEADERS ---");
    req.headers.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // Clone the request to read body for logging
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    console.log("\n--- REQUEST BODY ---");
    console.log("Raw body:", rawBody);

    // Parse the body with signature validation
    console.log("\n--- PARSING BODY ---");
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: string | undefined;
    }>(req, envSecret);

    console.log("\n--- VALIDATION RESULT ---");
    console.log("Signature is valid:", isValidSignature);
    console.log("Parsed body:", JSON.stringify(body, null, 2));

    if (!isValidSignature) {
      console.error("\n❌ AUTHENTICATION FAILED");
      console.error("The webhook signature is invalid.");
      console.error("Possible causes:");
      console.error(
        "1. Secret mismatch between Sanity webhook and environment variable",
      );
      console.error(
        "2. Secret in Sanity:",
        "[hidden - check Sanity webhook settings]",
      );
      console.error("3. Secret in Next.js:", envSecret || "NOT SET");
      console.error("4. Missing or incorrect signature header");
      console.error("\nTo fix:");
      console.error(
        "- Verify NEXT_PUBLIC_SANITY_WEBHOOK_SECRET in .env matches Sanity webhook secret",
      );
      console.error(
        "- Redeploy if you just added/changed the environment variable",
      );
      console.error("- Check webhook configuration in Sanity dashboard");

      return new Response("Invalid Signature", { status: 401 });
    }

    console.log("\n✅ AUTHENTICATION SUCCESSFUL");

    if (!body?._type) {
      console.error("\n❌ BAD REQUEST");
      console.error("Missing _type in body");
      console.error("Body received:", JSON.stringify(body, null, 2));
      console.error("\nTo fix:");
      console.error(
        '- Add projection to Sanity webhook: {_type, "slug": slug.current}',
      );
      return new Response("Bad Request", { status: 400 });
    }

    console.log("\n--- REVALIDATING ---");
    console.log("Revalidating tag:", body._type);
    if (body.slug) {
      console.log("Document slug:", body.slug);
    }

    revalidateTag(body._type);

    const response = {
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    };

    console.log("\n✅ REVALIDATION SUCCESSFUL");
    console.log("Response:", JSON.stringify(response, null, 2));
    console.log("=== END WEBHOOK PROCESSING ===\n");

    return NextResponse.json(response);
  } catch (error) {
    console.error("\n❌ ERROR PROCESSING WEBHOOK");
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error",
    );
    console.error("Full error:", error);
    console.error("=== END WEBHOOK PROCESSING (ERROR) ===\n");

    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 },
    );
  }
}
