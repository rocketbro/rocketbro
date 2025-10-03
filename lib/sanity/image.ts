import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Helper to get optimized image URL with default settings
export function getImageUrl(
  source: SanityImageSource,
  width?: number,
  height?: number,
) {
  let image = urlFor(source).auto("format").fit("max");

  if (width) {
    image = image.width(width);
  }

  if (height) {
    image = image.height(height);
  }

  return image.url();
}
