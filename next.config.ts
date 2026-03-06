import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  reactStrictMode: true,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "douglasmitchell.info",
      },
      {
        protocol: "https",
        hostname: "www.douglasmitchell.info",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
