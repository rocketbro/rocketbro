import "server-only";

import { createClient } from "next-sanity";

const sanityReadToken = process.env.SANITY_API_READ_TOKEN;

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  // For private datasets, authenticated requests should hit the live API.
  useCdn: process.env.NODE_ENV === "development" && !sanityReadToken,
  token: sanityReadToken,
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
  try {
    return await serverClient.fetch<QueryResponse>(query, params, {
      // Disable cache in development for instant updates
      cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
      next: {
        tags,
      },
    });
  } catch (error) {
    const maybeStatusCode =
      typeof error === "object" && error && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;

    if ((maybeStatusCode === 401 || maybeStatusCode === 403) && !sanityReadToken) {
      throw new Error(
        "Sanity query unauthorized. If your dataset is private, set SANITY_API_READ_TOKEN in your environment.",
      );
    }

    throw error;
  }
}
