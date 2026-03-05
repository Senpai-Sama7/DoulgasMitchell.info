import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
  keywords: ["photography", "architecture", "design", "portfolio", "blog", "visual arts"],
  authors: [{ name: "Senpai" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Senpai's Isekai",
    description: "Open-Source Humanity - A sophisticated visual journey",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Senpai's Isekai",
    description: "Open-Source Humanity - A sophisticated visual journey",
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
        className={`${fraunces.variable} ${manrope.variable} ${ibmPlexMono.variable} ${caveat.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Noise Texture Overlay */}
          <div className="noise-overlay" aria-hidden="true" style={{ pointerEvents: 'none' }} />
          
          {/* Main Content */}
          {children}
          
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
