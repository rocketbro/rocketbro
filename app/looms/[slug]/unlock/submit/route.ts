import { NextResponse } from "next/server";
import {
  createLoomAccessToken,
  getLoomAccessCookiePath,
  getSanityLoomAccessBySlug,
  LOOM_ACCESS_COOKIE_MAX_AGE_SECONDS,
  LOOM_ACCESS_COOKIE_NAME,
  verifyLoomPassword,
} from "@/lib/openloom/access";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const access = await getSanityLoomAccessBySlug(slug);
  const requestUrl = new URL(request.url);

  const loomUrl = new URL(getLoomAccessCookiePath(slug), requestUrl.origin);
  const unlockUrl = new URL(`${getLoomAccessCookiePath(slug)}/unlock`, requestUrl.origin);

  if (!access?.isPasswordProtected) {
    return NextResponse.redirect(loomUrl);
  }

  if (typeof access.accessPassword !== "string" || access.accessPassword.trim().length === 0) {
    unlockUrl.searchParams.set("misconfigured", "1");
    return NextResponse.redirect(unlockUrl);
  }

  const formData = await request.formData();
  const submittedPassword = formData.get("password");
  if (typeof submittedPassword !== "string" || !verifyLoomPassword(submittedPassword, access.accessPassword)) {
    unlockUrl.searchParams.set("error", "1");
    return NextResponse.redirect(unlockUrl);
  }

  const response = NextResponse.redirect(loomUrl);
  response.cookies.set({
    name: LOOM_ACCESS_COOKIE_NAME,
    value: createLoomAccessToken(slug),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: getLoomAccessCookiePath(slug),
    maxAge: LOOM_ACCESS_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
