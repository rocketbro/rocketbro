import type { Metadata } from "next";
import {
  Wix_Madefor_Display,
  EB_Garamond,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LayoutContent } from "@/components/LayoutContent";

const wixMadefor = Wix_Madefor_Display({
  variable: "--font-wix",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: "200",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rocketbro | Blog",
  description: "A lightweight blog built with Next.js and Sanity CMS",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${wixMadefor.variable} ${ebGaramond.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </body>
    </html>
  );
}
