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
      <body
        className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} ${sora.variable} antialiased`}
      >
        {/* Noise Texture Overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
