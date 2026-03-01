import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LoomViewer } from "@/components/openloom/LoomViewer";
import { SchemaOrg, generateWebSiteSchema } from "@/components/SchemaOrg";
import { getOpenLoomBySlug, listOpenLoomSummaries } from "@/lib/openloom/files";
import { sanityFetch } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const looms = await listOpenLoomSummaries();
  return looms.map((loom) => ({ slug: loom.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
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

          <header className="mb-10 max-w-4xl">
            <h1 className="text-5xl font-bold mb-3">{loom.tree.title || "Untitled Loom"}</h1>
            {loom.tree.description && (
              <p className="text-2xl opacity-80 whitespace-pre-wrap">
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
