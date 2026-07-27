import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  JetBrains_Mono,
  Source_Sans_3,
} from "next/font/google";
import "./globals.css";
import { ImmersiveRoot } from "@/components/immersive";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// View Transitions API (2025): enable same-document and cross-document
// transitions for seamless navigation. The @view-transition CSS rule in
// 2025-enhancements.css handles the actual styling. Progressive
// enhancement — unsupported browsers fall through to native navigation.

// Body: Geist (2026) — variable workhorse with soft aperture, 0.965
// x-height, and an opsz axis. Replaces Source Sans 3 as the primary
// `--font-sans` so display uses can opt into size-aware tracking.
const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Legacy alias — components that still reference --font-source-sans
// keep working without a sweep.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display: Fraunces (2026) — expressive variable serif. SOFT + WONK
// axes + opsz make it the creative-but-legible counterpoint to Geist.
// Used by the Story chapter slate and other long-take displays.
// Instrument Serif remains the fallback for sections not yet migrated.
// `weight: "variable"` is required when exposing `axes` to next/font.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  preload: false,
});

// Display fallback: Instrument Serif — kept for non-migrated surfaces
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// View Transitions API (2025 baseline). Enables seamless cross-page
// transitions via the @view-transition CSS rule in 2025-enhancements.css.
// Unsupported browsers fall back to native navigation.
export const unstable_View_Transitions = true;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#151820' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://douglasmitchell.info'),
  title: {
    default: "Douglas Mitchell | Operations Analyst & AI Practitioner",
    template: "%s | Douglas Mitchell"
  },
  description: "Operations Analyst, AI Practitioner, and author of The Confident Mind. Designs decision systems, automation with human checkpoints, and proof-driven operating models.",
  keywords: [
    "Douglas Mitchell",
    "Operations Analyst",
    "AI Practitioner",
    "AI Automation",
    "The Confident Mind",
    "Author",
    "Houston",
    "Systems Architecture",
    "Machine Learning",
    "Workflow Automation",
    "Google AI Certified",
    "Anthropic",
    "Context Engineering",
    "Decision Systems",
  ],
  authors: [{ name: "Douglas Mitchell" }],
  creator: "Douglas Mitchell",
  publisher: "Douglas Mitchell",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://douglasmitchell.info",
    siteName: "Douglas Mitchell",
    title: "Douglas Mitchell | Operations Analyst & AI Practitioner",
    description: "Operations Analyst, AI Practitioner, and author of The Confident Mind. Designs decision systems and proof-driven operating models.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Douglas Mitchell - Operations Analyst",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Douglas Mitchell | Operations Analyst & AI Practitioner",
    description: "Operations Analyst, AI Practitioner, and author of The Confident Mind. Designs decision systems and proof-driven operating models.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://douglasmitchell.info",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showRuntimeAnalytics = process.env.NODE_ENV === 'production';

  // Inline theme bootstrap — runs before first paint to prevent flash
  const themeBootstrapScript = `
    try {
      const storedTheme = window.localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch {}
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://douglasmitchell.info/#person",
        "name": "Douglas Mitchell",
        "url": "https://douglasmitchell.info",
        "jobTitle": "Operations Analyst",
        "worksFor": {
          "@type": "Organization",
          "@id": "https://douglasmitchell.info/#organization"
        },
        "sameAs": [
          "https://www.linkedin.com/in/douglas-mitchell-the-architect/",
          "https://github.com/Senpai-Sama7"
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://douglasmitchell.info/#organization",
        "name": "Douglas Mitchell",
        "url": "https://douglasmitchell.info",
        "founder": {
          "@type": "Person",
          "name": "Douglas Mitchell"
        },
        "description": "Operations Analyst, AI Practitioner, and Author of The Confident Mind.",
        "sameAs": [
          "https://www.linkedin.com/in/douglas-mitchell-the-architect/",
          "https://github.com/Senpai-Sama7"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://douglasmitchell.info/#website",
        "url": "https://douglasmitchell.info",
        "name": "Douglas Mitchell",
        "publisher": {
          "@type": "Organization",
          "@id": "https://douglasmitchell.info/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://douglasmitchell.info/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icons/favicon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Inline theme bootstrap prevents FOUC — must be synchronous */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${
          geist.variable
        } ${sourceSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} site-atmosphere relative antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        {/* Skip link for keyboard/screen reader navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <ImmersiveRoot>{children}</ImmersiveRoot>

        {/* PWA Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`,
          }}
        />
        <Toaster />
        {showRuntimeAnalytics && <Analytics />}
        {showRuntimeAnalytics && <SpeedInsights />}
      </body>
    </html>
  );
}
