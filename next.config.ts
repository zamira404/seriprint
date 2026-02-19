import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this project to avoid scanning parent folders.
  turbopack: {
    root: process.cwd(),
  },
  reactCompiler: true,
};

export default nextConfig;
