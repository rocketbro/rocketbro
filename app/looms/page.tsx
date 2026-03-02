import { Footer } from "@/components/Footer";
import { LoomCard } from "@/components/openloom/LoomCard";
import { SchemaOrg, generateWebSiteSchema } from "@/components/SchemaOrg";
import { listOpenLoomSummaries } from "@/lib/openloom/files";
import { sanityFetch } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity/types";

export const metadata = {
  title: "Looms",
  description: "Read OpenLoom tree conversations",
};

export default async function LoomsPage() {
  const [looms, settings] = await Promise.all([
    listOpenLoomSummaries(),
    sanityFetch<SITE_SETTINGS_QUERY_RESULT>({
      query: SITE_SETTINGS_QUERY,
      tags: ["settings"],
    }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <SchemaOrg
        schema={generateWebSiteSchema({
          name: settings?.siteTitle || "Rocketbro",
          description: "Read OpenLoom tree conversations",
          url: siteUrl,
        })}
      />

      <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
        <main className="max-w-7xl mx-auto px-6 py-16">
          <section className="mb-14 max-w-4xl">
            <h1 className="text-5xl font-bold mb-5">Looms</h1>
            <p className="text-2xl opacity-80">
              Read-only OpenLoom trees. Right-click any node to view its continuations.
            </p>
            <div className="mt-8 space-y-6 max-w-3xl">
              <p className="text-3xl font-bold">Getting Started</p>
              <p className="text-2xl opacity-85">
                Messages are called nodes. Right click any node to view continuations.
              </p>
              <p className="text-2xl opacity-85">
                When viewing continuations, a green indicator appears for nodes on the current
                branch.
              </p>
              <p className="text-2xl opacity-85">
                Continuations also display the number of on-branch nodes they precede in square
                brackets: [3]
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-lg font-mono">
              <a
                href="https://www.latentspaces.app/loom-interface"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent dark:text-accent-dark hover:text-accent-hover dark:hover:text-accent-hover-dark transition-colors underline"
              >
                What is a Loom Interface?
              </a>
              <a
                href="https://www.latentspaces.app/openloom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent dark:text-accent-dark hover:text-accent-hover dark:hover:text-accent-hover-dark transition-colors underline"
              >
                Read about the OpenLoom Spec
              </a>
            </div>
          </section>

          {looms.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {looms.map((loom) => (
                <LoomCard key={loom.slug} loom={loom} />
              ))}
            </section>
          ) : (
            <div className="text-center py-16 border border-dashed border-border dark:border-border-dark rounded-lg">
              <p className="text-lg opacity-70">
                No OpenLoom files found in Sanity or `lib/openloom` yet.
              </p>
            </div>
          )}
        </main>

        <Footer settings={settings} />
      </div>
    </>
  );
}
