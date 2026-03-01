import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { sanityFetch } from "@/lib/sanity/client";
import { LOOM_ACCESS_BY_SLUG_QUERY } from "@/lib/sanity/queries";
import type { LOOM_ACCESS_BY_SLUG_QUERY_RESULT } from "@/lib/sanity/types";

export const LOOM_ACCESS_COOKIE_NAME = "loom_access";
export const LOOM_ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface LoomAccessTokenPayload {
  slug: string;
  exp: number;
  v: 1;
}

function getLoomAccessSecret() {
  const secret = process.env.LOOM_ACCESS_SECRET || process.env.SANITY_WEBHOOK_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "Missing LOOM_ACCESS_SECRET (or SANITY_WEBHOOK_SECRET) for loom password protection.",
    );
  }

  return secret;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getLoomAccessSecret()).update(encodedPayload).digest("base64url");
}

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getLoomAccessCookiePath(slug: string) {
  return `/looms/${slug}`;
}

export function createLoomAccessToken(slug: string) {
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + LOOM_ACCESS_COOKIE_MAX_AGE_SECONDS;
  const payload: LoomAccessTokenPayload = {
    slug,
    exp: expiresAtSeconds,
    v: 1,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyLoomAccessToken(token: string | undefined, expectedSlug: string) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!secureCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<LoomAccessTokenPayload>;

    if (payload.v !== 1 || payload.slug !== expectedSlug || typeof payload.exp !== "number") {
      return false;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function verifyLoomPassword(submittedPassword: string, storedPassword: string) {
  const submittedHash = createHash("sha256").update(submittedPassword, "utf8").digest();
  const storedHash = createHash("sha256").update(storedPassword, "utf8").digest();
  return timingSafeEqual(submittedHash, storedHash);
}

export async function getSanityLoomAccessBySlug(slug: string) {
  const result = await sanityFetch<LOOM_ACCESS_BY_SLUG_QUERY_RESULT>({
    query: LOOM_ACCESS_BY_SLUG_QUERY,
    params: { slug },
    tags: ["loom", `loom:${slug}`],
  });

  if (!result || !result.slug) {
    return null;
  }

  return {
    slug: result.slug,
    isPasswordProtected: Boolean(result.isPasswordProtected),
    accessPassword: result.accessPassword,
  };
}
