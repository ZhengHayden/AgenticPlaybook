import path from "node:path";
import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "true";
const repoBase = "/AgenticPlaybook/app";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGhPages ? repoBase : undefined,
  assetPrefix: isGhPages ? repoBase : undefined,
};

export default nextConfig;
