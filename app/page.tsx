/* eslint-disable @typescript-eslint/no-explicit-any */
import { sanityFetch } from "@/lib/sanity/client";
import { RECENT_POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import { PostCard } from "@/components/PostCard";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { SchemaOrg, generateWebSiteSchema } from "@/components/SchemaOrg";
import type {
  RECENT_POSTS_QUERYResult,
  SITE_SETTINGS_QUERYResult,
} from "@/lib/sanity/types";

// Enable on-demand revalidation via API route
// This allows revalidatePath() and revalidateTag() to work

export default async function Home() {
  const [settings, posts] = await Promise.all([
    sanityFetch<SITE_SETTINGS_QUERYResult>({
      query: SITE_SETTINGS_QUERY,
      tags: ["settings"],
    }),
    sanityFetch<RECENT_POSTS_QUERYResult>({
      query: RECENT_POSTS_QUERY,
      tags: ["post"],
    }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <SchemaOrg
        schema={generateWebSiteSchema({
          name: settings?.siteTitle || "Rocketbro",
          description: settings?.siteDescription || "A lightweight blog",
          url: siteUrl,
        })}
      />

      <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          {/* Intro Section */}
          <section className="mb-20">
            <div className="max-w-3xl">
              <h2 className="text-5xl font-bold mb-8">
                {settings?.siteDescription || "Welcome to the blog"}
              </h2>
              {settings?.introText && settings.introText.length > 0 && (
                <div className="text-xl leading-relaxed opacity-90">
                  <PortableTextRenderer value={settings.introText as any} />
                </div>
              )}
            </div>
          </section>

          {/* Recent Posts Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard key={post._id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border dark:border-border-dark rounded-lg">
                <p className="text-lg opacity-70">
                  No posts yet. Create your first post in Sanity Studio!
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border dark:border-border-dark mt-24">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm opacity-70">
                © {new Date().getFullYear()}{" "}
                {settings?.siteTitle || "Rocketbro"}. All rights reserved.
              </p>
              {settings?.socialLinks && settings.socialLinks.length > 0 && (
                <div className="flex gap-4">
                  {settings.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-accent dark:hover:text-accent-dark transition-colors"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
