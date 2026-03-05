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
