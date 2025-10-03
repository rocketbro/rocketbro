import Script from "next/script";

interface Person {
  "@type": "Person";
  name: string;
  url?: string;
  image?: string;
}

interface Organization {
  "@type": "Organization";
  name: string;
  url?: string;
  logo?: string;
}

interface BlogPostingSchema {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: Person | Organization;
  publisher: Organization;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
}

interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  description?: string;
  url: string;
  publisher?: Organization;
}

type SchemaOrgType =
  | BlogPostingSchema
  | WebSiteSchema
  | Record<string, unknown>;

interface SchemaOrgProps {
  schema: SchemaOrgType;
}

export function SchemaOrg({ schema }: SchemaOrgProps) {
  return (
    <Script
      id="schema-org"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Helper functions to generate common schemas
export function generateBlogPostSchema({
  title,
  description,
  image,
  publishedAt,
  updatedAt,
  authorName,
  authorUrl,
  url,
  siteName,
  siteUrl,
}: {
  title: string;
  description?: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  authorUrl?: string;
  url: string;
  siteName: string;
  siteUrl: string;
}): BlogPostingSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: image,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function generateWebSiteSchema({
  name,
  description,
  url,
}: {
  name: string;
  description?: string;
  url: string;
}): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url,
  };
}
