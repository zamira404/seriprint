import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this project to avoid scanning parent folders.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "basicweb.it",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
