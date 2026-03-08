import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, JetBrains_Mono, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 0.5,
  userScalable: true,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://douglasmitchell.info'),
  title: {
    default: "Douglas Mitchell | Operations Analyst & AI Practitioner",
    template: "%s | Douglas Mitchell"
  },
  description: "Operations Analyst, AI Practitioner, and Author of The Confident Mind. Building systems at the intersection of technology and human potential. Google AI & Anthropic Certified.",
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
    description: "Operations Analyst, AI Practitioner, and Author of The Confident Mind. Building systems at the intersection of technology and human potential.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Douglas Mitchell - The Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Douglas Mitchell | Operations Analyst & AI Practitioner",
    description: "Operations Analyst, AI Practitioner, and Author of The Confident Mind. Building systems at the intersection of technology and human potential.",
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
        "description": "Operations Analyst, AI Practitioner, and Author of The Confident Mind. Building systems at the intersection of technology and human potential.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icons/favicon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${jetbrainsMono.variable} ${shareTechMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {/* Skip Link for Accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        {/* Noise Overlay for ASCII Texture */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Main Content */}
        {children}
        
        {/* Toast Notifications */}
        <Toaster />
      </body>
    </html>
  );
}
