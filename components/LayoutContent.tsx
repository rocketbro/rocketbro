import { sanityFetch } from "@/lib/sanity/server-client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity/types";
import { TopNav } from "./TopNav";

export async function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>({
    query: SITE_SETTINGS_QUERY,
    tags: ["settings"],
  });

  return (
    <>
      <TopNav siteTitle={settings?.siteTitle || "Rocketbro"} />
      <div className="pt-[73px]">{children}</div>
    </>
  );
}
