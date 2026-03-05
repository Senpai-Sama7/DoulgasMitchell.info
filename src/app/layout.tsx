import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono, Caveat } from "next/font/google";
import "./globals.css";

// Fraunces - Sophisticated Serif for Headlines
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Manrope - Sans-serif UI Font
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// IBM Plex Mono - Monospace for dates/numbers
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Caveat - Handwritten font for quotes
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Senpai's Isekai | Open-Source Humanity",
  description: "A sophisticated personal blog and photography portfolio. Exploring architecture, light, and the art of visual storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${manrope.variable} ${ibmPlexMono.variable} ${caveat.variable} antialiased`}
      >
        {/* Noise Texture Overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
