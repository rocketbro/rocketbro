import type { SITE_SETTINGS_QUERYResult } from "@/lib/sanity/types";

interface FooterProps {
  settings: SITE_SETTINGS_QUERYResult;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="border-t border-border dark:border-border-dark mt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-70">
            © {new Date().getFullYear()}{" "}
            {settings?.siteTitle || "Rocketbro"}. All rights reserved.
          </p>
          {settings?.socialLinks && settings.socialLinks.length > 0 && (
            <div className="flex gap-4">
              {settings.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-accent dark:hover:text-accent-dark transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
