import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import {
  getLoomAccessCookiePath,
  getSanityLoomAccessBySlug,
  LOOM_ACCESS_COOKIE_NAME,
  verifyLoomAccessToken,
} from "@/lib/openloom/access";
import { getOpenLoomBySlug } from "@/lib/openloom/files";
import { sanityFetch } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity/types";
import type { Metadata } from "next";

interface UnlockPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; misconfigured?: string }>;
}

export const metadata: Metadata = {
  title: "Unlock Loom",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UnlockLoomPage({ params, searchParams }: UnlockPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const [loom, access, settings] = await Promise.all([
    getOpenLoomBySlug(slug),
    getSanityLoomAccessBySlug(slug),
    sanityFetch<SITE_SETTINGS_QUERY_RESULT>({
      query: SITE_SETTINGS_QUERY,
      tags: ["settings"],
    }),
  ]);

  if (!loom) {
    notFound();
  }

  if (!access?.isPasswordProtected) {
    redirect(`/looms/${slug}`);
  }

  const token = (await cookies()).get(LOOM_ACCESS_COOKIE_NAME)?.value;
  if (verifyLoomAccessToken(token, slug)) {
    redirect(`/looms/${slug}`);
  }

  const hasError = query.error === "1";
  const misconfigured = query.misconfigured === "1";

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10">
          <Link
            href={getLoomAccessCookiePath(slug)}
            className="inline-flex items-center rounded-full border border-primary px-4 gap-2 text-primary dark:text-primary-dark hover:text-accent dark:hover:text-accent-dark transition-colors font-cascadia"
          >
            <span>←</span>
            <span>Back to loom</span>
          </Link>
        </div>

        <section className="rounded-2xl border border-border dark:border-border-dark p-6 md:p-8">
          <h1 className="text-4xl font-bold mb-3">Password Protected Loom</h1>
          <p className="text-xl opacity-80 mb-6">
            Enter the password to view{" "}
            <span className="font-bold">{loom.tree.title || "this loom"}</span>.
          </p>

          {misconfigured ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-mono">
              Password protection is enabled, but no password is configured yet.
            </p>
          ) : null}

          {hasError ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-mono">
              Incorrect password. Please try again.
            </p>
          ) : null}

          <form action={`/looms/${slug}/unlock/submit`} method="post" className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-mono opacity-80 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded-full border border-primary px-4 py-2 gap-2 text-primary dark:text-primary-dark hover:text-accent dark:hover:text-accent-dark transition-colors font-cascadia"
            >
              Unlock loom
            </button>
          </form>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
