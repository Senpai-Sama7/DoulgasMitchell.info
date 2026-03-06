import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sora,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

// Space Grotesk - Modern display font for headings
const spaceGrotesk = Space_Grotesk({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Plus Jakarta Sans - Sleek professional UI font
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// JetBrains Mono - Monospace for technical metadata
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Sora - Modern accent font for callouts
const sora = Sora({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.douglasmitchell.info"),
  title: "Senpai's Isekai | Open-Source Humanity",
  description: "A sophisticated personal blog and photography portfolio. Exploring architecture, light, and the art of visual storytelling.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Senpai's Isekai | Open-Source Humanity",
    description:
      "A sophisticated personal blog and photography portfolio. Exploring architecture, light, and the art of visual storytelling.",
    url: "/",
    siteName: "Senpai's Isekai",
    type: "website",
    images: [
      {
        url: "/images/hero/hero-main.png",
        width: 1344,
        height: 768,
        alt: "Hero image from Senpai's Isekai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Senpai's Isekai | Open-Source Humanity",
    description:
      "A sophisticated personal blog and photography portfolio. Exploring architecture, light, and the art of visual storytelling.",
    images: ["/images/hero/hero-main.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} ${sora.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="noise-overlay" aria-hidden="true" />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
