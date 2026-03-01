import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  // Use CDN in development for live updates, disable in production for on-demand revalidation
  useCdn: process.env.NODE_ENV === "development",
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});

// Helper function for fetching data with type safety and revalidation support
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags: string[];
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params, {
    // Disable cache in development for instant updates
    cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
    next: {
      tags,
    },
  });
}
