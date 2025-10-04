import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { RECENT_POSTS_QUERYResult } from "@/lib/sanity/types";
import { IMAGE_SIZES } from "@/lib/constants";

type PostCardProps = RECENT_POSTS_QUERYResult[0];

export function PostCard(post: PostCardProps) {
  const { title, slug, excerpt, publishedAt, mainImage, author, categories } =
    post;
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="group flex flex-col h-full border border-border dark:border-border-dark rounded-lg overflow-hidden hover:border-accent dark:hover:border-accent-dark transition-all duration-300">
      {mainImage?.asset && (
        <Link
          href={`/blog/${slug?.current || ""}`}
          className="relative aspect-video overflow-hidden"
        >
          <Image
            src={urlFor(mainImage).width(IMAGE_SIZES.POST_CARD.width).height(IMAGE_SIZES.POST_CARD.height).url()}
            alt={mainImage.alt || title || "Blog post image"}
            width={IMAGE_SIZES.POST_CARD.width}
            height={IMAGE_SIZES.POST_CARD.height}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      <div className="flex flex-col flex-1 p-6">
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <span
                key={category._id}
                className="text-xs uppercase tracking-wider text-accent dark:text-accent-dark font-mono"
              >
                {category.title}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/blog/${slug?.current || ""}`}
          className="group-hover:text-accent dark:group-hover:text-accent-dark transition-colors"
        >
          <h3 className="text-2xl font-bold mb-3 line-clamp-2">
            {title || "Untitled"}
          </h3>
        </Link>

        {excerpt && (
          <p className="text-foreground dark:text-foreground-dark opacity-80 mb-4 line-clamp-3 flex-1 text-xl">
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border dark:border-border-dark">
          {author?.image?.asset && (
            <Image
              src={urlFor(author.image).width(IMAGE_SIZES.AVATAR_SMALL.width).height(IMAGE_SIZES.AVATAR_SMALL.height).url()}
              alt={author.name || "Author"}
              width={IMAGE_SIZES.AVATAR_SMALL.width}
              height={IMAGE_SIZES.AVATAR_SMALL.height}
              className="rounded-full"
            />
          )}
          <div className="flex flex-col">
            {author?.name && (
              <span className="text-md font-medium">{author.name}</span>
            )}
            {formattedDate && (
              <time className="text-sm opacity-70" dateTime={publishedAt || ""}>
                {formattedDate}
              </time>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
