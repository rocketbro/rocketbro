import { defineQuery } from "next-sanity";

// Query for recent posts on the landing page
export const RECENT_POSTS_QUERY = defineQuery(`
  *[_type == "post"] | order(publishedAt desc)[0...6] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage {
      asset->,
      alt
    },
    author-> {
      name,
      slug,
      image {
        asset->,
        alt
      }
    },
    categories[]-> {
      _id,
      title,
      slug
    }
  }
`);

// Query for a single post by slug
export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    _updatedAt,
    mainImage {
      asset->,
      alt
    },
    body,
    author-> {
      name,
      slug,
      bio,
      image {
        asset->,
        alt
      }
    },
    categories[]-> {
      _id,
      title,
      slug
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage {
        asset->,
        alt
      }
    }
  }
`);

// Query for all post slugs (for generateStaticParams)
export const ALL_POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`);

// Query for site settings
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "settings"][0] {
    siteTitle,
    siteDescription,
    introText,
    socialLinks[] {
      platform,
      url
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage {
        asset->,
        alt
      }
    }
  }
`);

// Query for related posts (exclude current post)
export const RELATED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage {
      asset->,
      alt
    }
  }
`);
