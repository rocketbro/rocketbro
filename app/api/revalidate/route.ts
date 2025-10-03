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
  try {
    const envSecret = process.env.NEXT_PUBLIC_SANITY_WEBHOOK_SECRET;

    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: string | undefined;
    }>(req, envSecret);

    if (!isValidSignature) {
      console.error("Webhook authentication failed - invalid signature");
      return new Response("Invalid Signature", { status: 401 });
    }

    if (!body?._type) {
      console.error("Webhook missing _type in body");
      return new Response("Bad Request", { status: 400 });
    }

    console.log(`Revalidating tag: ${body._type}${body.slug ? ` (${body.slug})` : ""}`);
    revalidateTag(body._type);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (error) {
    console.error(
      "Webhook error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 },
    );
  }
}
