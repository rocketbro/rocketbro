import { notFound } from "next/navigation";
import Image from "next/image";
import { sanityFetch } from "@/lib/sanity/client";
import {
  POST_BY_SLUG_QUERY,
  ALL_POST_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/lib/sanity/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { SchemaOrg, generateBlogPostSchema } from "@/components/SchemaOrg";
import { urlFor } from "@/lib/sanity/image";
import { Footer } from "@/components/Footer";
import { IMAGE_SIZES } from "@/lib/constants";
import type {
  POST_BY_SLUG_QUERYResult,
  ALL_POST_SLUGS_QUERYResult,
  SITE_SETTINGS_QUERYResult,
} from "@/lib/sanity/types";
import type { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Enable on-demand revalidation via API route
// This allows revalidatePath() and revalidateTag() to work

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await sanityFetch<ALL_POST_SLUGS_QUERYResult>({
    query: ALL_POST_SLUGS_QUERY,
    tags: ["post"],
  });

  return posts.map((post) => ({
    slug: post.slug || "",
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<POST_BY_SLUG_QUERYResult>({
    query: POST_BY_SLUG_QUERY,
    params: { slug },
    tags: ["post", `post:${slug}`],
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const imageUrl = post.mainImage?.asset
    ? urlFor(post.mainImage).width(IMAGE_SIZES.OG.width).height(IMAGE_SIZES.OG.height).url()
    : undefined;

  return {
    title: post.seo?.metaTitle || post.title || "Blog Post",
    description: post.seo?.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.seo?.metaTitle || post.title || "Blog Post",
      description: post.seo?.metaDescription || post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post._updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.mainImage?.alt || post.title || "Blog post image",
            },
          ]
        : undefined,
      url: postUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.metaTitle || post.title || "Blog Post",
      description: post.seo?.metaDescription || post.excerpt || undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    sanityFetch<POST_BY_SLUG_QUERYResult>({
      query: POST_BY_SLUG_QUERY,
      params: { slug },
      tags: ["post", `post:${slug}`],
    }),
    sanityFetch<SITE_SETTINGS_QUERYResult>({
      query: SITE_SETTINGS_QUERY,
      tags: ["settings"],
    }),
  ]);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const imageUrl = post.mainImage?.asset
    ? urlFor(post.mainImage).width(IMAGE_SIZES.OG.width).height(IMAGE_SIZES.OG.height).url()
    : undefined;

  const formattedDate = new Date(post.publishedAt || "").toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <>
      <SchemaOrg
        schema={generateBlogPostSchema({
          title: post.title || "Blog Post",
          description: post.excerpt || undefined,
          image: imageUrl,
          publishedAt: post.publishedAt || new Date().toISOString(),
          updatedAt: post._updatedAt,
          authorName: post.author?.name || "Anonymous",
          authorUrl: post.author?.slug?.current
            ? `${siteUrl}/author/${post.author.slug.current}`
            : undefined,
          url: postUrl,
          siteName: settings?.siteTitle || "Rocketbro",
          siteUrl: siteUrl,
        })}
      />

      <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
        {/* Article */}
        <article className="max-w-4xl mx-auto px-6 py-16">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <span
                  key={category._id}
                  className="text-xs uppercase tracking-wider text-accent dark:text-accent-dark font-mono"
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {post.title || "Untitled"}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl opacity-80 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-border dark:border-border-dark">
            {post.author?.image?.asset && (
              <Image
                src={urlFor(post.author.image).width(IMAGE_SIZES.AVATAR_MEDIUM.width).height(IMAGE_SIZES.AVATAR_MEDIUM.height).url()}
                alt={post.author.name || "Author"}
                width={IMAGE_SIZES.AVATAR_MEDIUM.width}
                height={IMAGE_SIZES.AVATAR_MEDIUM.height}
                className="rounded-full"
              />
            )}
            <div>
              {post.author?.name && (
                <p className="font-medium text-lg">{post.author.name}</p>
              )}
              <time
                className="text-sm opacity-70"
                dateTime={post.publishedAt || ""}
              >
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Featured Image */}
          {post.mainImage?.asset && (
            <figure className="mb-12">
              <Image
                src={urlFor(post.mainImage).width(IMAGE_SIZES.POST_FEATURED.width).height(IMAGE_SIZES.POST_FEATURED.height).url()}
                alt={post.mainImage.alt || post.title || "Blog post image"}
                width={IMAGE_SIZES.POST_FEATURED.width}
                height={IMAGE_SIZES.POST_FEATURED.height}
                className="rounded-lg w-full h-auto"
                priority
              />
              {post.mainImage.alt && (
                <figcaption className="text-sm opacity-70 mt-3 text-center">
                  {post.mainImage.alt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.body && <PortableTextRenderer value={post.body} />}
          </div>

          {/* Author Bio */}
          {post.author?.bio && (
            <div className="mt-16 pt-8 border-t border-border dark:border-border-dark">
              <div className="flex gap-6 items-start">
                {post.author.image?.asset && (
                  <Image
                    src={urlFor(post.author.image).width(IMAGE_SIZES.AVATAR_LARGE.width).height(IMAGE_SIZES.AVATAR_LARGE.height).url()}
                    alt={post.author.name || "Author"}
                    width={IMAGE_SIZES.AVATAR_LARGE.width}
                    height={IMAGE_SIZES.AVATAR_LARGE.height}
                    className="rounded-full flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    About {post.author.name || "the author"}
                  </h3>
                  <p className="opacity-80 leading-relaxed">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Back to Home */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent dark:text-accent-dark hover:text-accent-hover dark:hover:text-accent-hover-dark transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to home
          </Link>
        </div>

        <Footer settings={settings} />
      </div>
    </>
  );
}
