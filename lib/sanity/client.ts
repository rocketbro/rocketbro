import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  // Public client for image URLs and browser-safe usage.
  useCdn: process.env.NODE_ENV === "development",
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});
