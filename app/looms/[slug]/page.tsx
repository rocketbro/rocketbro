import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LoomViewer } from "@/components/openloom/LoomViewer";
import {
  getLoomAccessCookiePath,
  getSanityLoomAccessBySlug,
  LOOM_ACCESS_COOKIE_NAME,
  verifyLoomAccessToken,
} from "@/lib/openloom/access";
import { SchemaOrg, generateWebSiteSchema } from "@/components/SchemaOrg";
import { getOpenLoomBySlug } from "@/lib/openloom/files";
import { sanityFetch } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const access = await getSanityLoomAccessBySlug(slug);
  if (access?.isPasswordProtected) {
    const token = (await cookies()).get(LOOM_ACCESS_COOKIE_NAME)?.value;
    if (!verifyLoomAccessToken(token, slug)) {
      return {
        title: "Protected Loom | Looms",
        description: "This loom is password protected.",
      };
    }
  }

  const loom = await getOpenLoomBySlug(slug);

  if (!loom) {
    return { title: "Loom Not Found" };
  }

  return {
    title: `${loom.tree.title || "Loom"} | Looms`,
    description: loom.tree.description || "OpenLoom tree viewer",
  };
}

export default async function LoomPage({ params }: PageProps) {
  const { slug } = await params;
  const access = await getSanityLoomAccessBySlug(slug);
  if (access?.isPasswordProtected) {
    const token = (await cookies()).get(LOOM_ACCESS_COOKIE_NAME)?.value;
    if (!verifyLoomAccessToken(token, slug)) {
      redirect(`${getLoomAccessCookiePath(slug)}/unlock`);
    }
  }

  const [loom, settings] = await Promise.all([
    getOpenLoomBySlug(slug),
    sanityFetch<SITE_SETTINGS_QUERY_RESULT>({
      query: SITE_SETTINGS_QUERY,
      tags: ["settings"],
    }),
  ]);

  if (!loom) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <SchemaOrg
        schema={generateWebSiteSchema({
          name: loom.tree.title || "Loom",
          description: loom.tree.description || "OpenLoom tree viewer",
          url: `${siteUrl}/looms/${loom.slug}`,
        })}
      />

      <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="mb-8">
            <Link
              href="/looms"
              className="inline-flex items-center gap-2 text-lg opacity-80 hover:opacity-100 transition-opacity"
            >
              <span>←</span>
              <span>All looms</span>
            </Link>
          </div>

          <header className="mt-8 md:mt-12 mb-16 md:mb-24 max-w-4xl text-center">
            <h1 className="text-5xl font-bold mb-6 md:mb-8">
              {loom.tree.title || "Untitled Loom"}
            </h1>
            {loom.tree.description && (
              <p className="text-2xl opacity-80 whitespace-pre-wrap text-left">
                {loom.tree.description}
              </p>
            )}
          </header>

          <LoomViewer tree={loom.tree} />
        </main>

        <Footer settings={settings} />
      </div>
    </>
  );
}
