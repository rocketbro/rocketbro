import { sanityFetch } from "@/lib/sanity/client";
import { LINKS_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import { LinkCard } from "@/components/LinkCard";
import { SchemaOrg, generateWebSiteSchema } from "@/components/SchemaOrg";
import { Footer } from "@/components/Footer";
import type {
  LINKS_QUERYResult,
  SITE_SETTINGS_QUERYResult,
} from "@/lib/sanity/types";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { IMAGE_SIZES } from "@/lib/constants";

export const metadata = {
  title: "Links",
  description: "Check out my curated collection of links and resources",
};

export default async function LinksPage() {
  const [linksData, settings] = await Promise.all([
    sanityFetch<LINKS_QUERYResult>({
      query: LINKS_QUERY,
      tags: ["links"],
    }),
    sanityFetch<SITE_SETTINGS_QUERYResult>({
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
          description: linksData?.description || "My curated collection of links",
          url: siteUrl,
        })}
      />

      <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          {linksData ? (
            <>
              {/* Header Section */}
              <section className="mb-16">
                {linksData.headerImage?.asset && (
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
                    <Image
                      src={urlFor(linksData.headerImage)
                        .width(IMAGE_SIZES.POST_FEATURED.width)
                        .height(IMAGE_SIZES.POST_FEATURED.height)
                        .url()}
                      alt={linksData.headerImage.alt || "Links page header"}
                      width={IMAGE_SIZES.POST_FEATURED.width}
                      height={IMAGE_SIZES.POST_FEATURED.height}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                )}

                <div className="max-w-3xl">
                  <h1 className="text-5xl font-bold mb-6">
                    {linksData.title || "Links"}
                  </h1>
                  {linksData.description && (
                    <p className="text-xl leading-relaxed opacity-90">
                      {linksData.description}
                    </p>
                  )}
                </div>
              </section>

              {/* Links Grid Section */}
              <section>
                {linksData.links && linksData.links.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {linksData.links
                      .filter((link): link is typeof link & { url: string } => link.url !== null)
                      .map((link, index) => ({
                        url: link.url,
                        description: link.description ?? undefined,
                        image: link.image && link.image.asset ? {
                          asset: {
                            _ref: link.image.asset._id,
                            _type: link.image.asset._type,
                            url: link.image.asset.url,
                          },
                          alt: link.image.alt ?? undefined,
                        } : undefined,
                        _index: index,
                      }))
                      .map(({ _index, ...link }) => (
                        <LinkCard key={_index} {...link} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-border dark:border-border-dark rounded-lg">
                    <p className="text-lg opacity-70">
                      No links yet. Add some in Sanity Studio!
                    </p>
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="text-center py-16 border border-dashed border-border dark:border-border-dark rounded-lg">
              <p className="text-lg opacity-70">
                Links page not created yet. Create one in Sanity Studio!
              </p>
            </div>
          )}
        </main>

        <Footer settings={settings} />
      </div>
    </>
  );
}
