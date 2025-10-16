"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { IMAGE_SIZES } from "@/lib/constants";
import { useState } from "react";

interface LinkData {
  url: string;
  description?: string;
  image?: {
    asset?: {
      _ref?: string;
      _type?: string;
      url?: string;
    };
    alt?: string;
  };
}

type LinkCardProps = LinkData;

export function LinkCard({ url, description, image }: LinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const domain = new URL(url).hostname.replace("www.", "");

  const hasImage = image?.asset && !imageError;

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
      <article className="group flex flex-col h-full border border-border dark:border-border-dark rounded-lg overflow-hidden hover:border-accent dark:hover:border-accent-dark transition-all duration-300 cursor-pointer">
        {hasImage && (
          <div className="relative aspect-video overflow-hidden bg-border dark:bg-border-dark">
            <Image
              src={urlFor(image).width(IMAGE_SIZES.POST_CARD.width).height(IMAGE_SIZES.POST_CARD.height).url()}
              alt={image.alt || domain || "Link preview"}
              width={IMAGE_SIZES.POST_CARD.width}
              height={IMAGE_SIZES.POST_CARD.height}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {!hasImage && (
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-accent/10 to-accent-dark/10 dark:from-accent-dark/20 dark:to-accent/20 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-accent dark:text-accent-dark opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 p-6">
          <p className="text-xs uppercase tracking-wider text-accent dark:text-accent-dark font-mono mb-2">
            {domain}
          </p>

          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">
            {description || url}
          </h3>

          {description && (
            <p className="text-foreground dark:text-foreground-dark opacity-80 text-md line-clamp-2 flex-1 pb-2">
              {url}
            </p>
          )}

          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border dark:border-border-dark">
            <svg
              className="w-4 h-4 text-accent dark:text-accent-dark opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-sm text-foreground dark:text-foreground-dark opacity-70">
              Open in new tab
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
