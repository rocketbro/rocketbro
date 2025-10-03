import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Verify the secret token
    const secret = request.nextUrl.searchParams.get("secret");
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 },
      );
    }

    // Get the document type and slug from the webhook payload
    const { _type, slug } = body;

    // Revalidate based on document type
    switch (_type) {
      case "post":
        // Revalidate the specific post page
        if (slug?.current) {
          revalidatePath(`/blog/${slug.current}`);
        }
        // Revalidate the home page (shows recent posts)
        revalidatePath("/");
        // Revalidate by tag
        revalidateTag("post");
        if (slug?.current) {
          revalidateTag(`post:${slug.current}`);
        }
        break;

      case "settings":
        // Revalidate all pages when settings change
        revalidatePath("/", "layout");
        revalidateTag("settings");
        break;

      case "author":
        // Revalidate all posts that might reference this author
        revalidatePath("/");
        revalidateTag("post");
        break;

      case "category":
        // Revalidate all posts that might reference this category
        revalidatePath("/");
        revalidateTag("post");
        break;

      default:
        // For any other document type, revalidate home page
        revalidatePath("/");
    }

    return NextResponse.json(
      {
        revalidated: true,
        now: Date.now(),
        type: _type,
        slug: slug?.current,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error revalidating:", err);
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 },
    );
  }
}
