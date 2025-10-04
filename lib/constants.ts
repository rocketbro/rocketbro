/**
 * Image size constants for consistent image dimensions across the application.
 * Used with Sanity's image URL builder.
 */
export const IMAGE_SIZES = {
  /** Open Graph / Social media images (1200x630) */
  OG: { width: 1200, height: 630 },
  /** Post card thumbnail images (800x450) */
  POST_CARD: { width: 800, height: 450 },
  /** Featured post image on blog post page (1200x675) */
  POST_FEATURED: { width: 1200, height: 675 },
  /** Portable text inline images (1200x675) */
  INLINE_IMAGE: { width: 1200, height: 675 },
  /** Large author avatar (96x96) */
  AVATAR_LARGE: { width: 96, height: 96 },
  /** Medium author avatar (64x64) */
  AVATAR_MEDIUM: { width: 64, height: 64 },
  /** Small author avatar (40x40) */
  AVATAR_SMALL: { width: 40, height: 40 },
} as const;
