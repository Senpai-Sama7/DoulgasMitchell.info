import type { Metadata, Viewport } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sora,
  Space_Grotesk,
} from "next/font/google";
import { Providers } from "@/components/providers";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.douglasmitchell.info"),
  title: {
    default: "Douglas Mitchell | Photography & Creative Work",
    template: "%s | Douglas Mitchell",
  },
  description: "Douglas Mitchell's personal portfolio — exploring architecture, light, technology, and creative expression through photography and writing.",
  keywords: ["Douglas Mitchell", "photography", "architecture", "portfolio", "blog", "creative"],
  authors: [{ name: "Douglas Mitchell" }],
  creator: "Douglas Mitchell",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.douglasmitchell.info",
    siteName: "Douglas Mitchell",
    title: "Douglas Mitchell | Photography & Creative Work",
    description: "Exploring architecture, light, technology, and creative expression through photography and writing.",
    images: [
      {
        url: "/images/hero/hero-main.png",
        width: 1344,
        height: 768,
        alt: "Hero image from Douglas Mitchell portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Douglas Mitchell | Photography & Creative Work",
    description: "Exploring architecture, light, technology, and creative expression through photography and writing.",
    images: ["/images/hero/hero-main.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" href="/icons/favicon-dm.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} ${sora.variable} antialiased`}
      >
        <Providers>
          {/* Noise Texture Overlay */}
          <div className="noise-overlay" aria-hidden="true" />
          
          {/* Main Content */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
