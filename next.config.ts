import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

// Get the repository name from environment variable or use default
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'wedding-archive';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configure basePath and assetPrefix for GitHub Pages
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
};

export default nextConfig;
