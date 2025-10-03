import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false, // Set to false for SSG to ensure fresh data
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});

// Helper function for fetching data with type safety
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
}) {
  return client.fetch<QueryResponse>(query, params, {
    next: {
      // Remove revalidate: false to enable on-demand revalidation
      // Pages will be generated statically but can be revalidated via API
      tags,
    },
  });
}
