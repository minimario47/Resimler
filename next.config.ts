import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

// Get the repository name from environment variable or use default
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'Resimler';

// R2 Public URL for fast photo delivery
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configure basePath and assetPrefix for GitHub Pages
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  // Make R2 URL available to the app
  env: {
    NEXT_PUBLIC_R2_PUBLIC_URL: r2PublicUrl,
  },
  // Copy JSON files to output for static access
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Explicitly use webpack instead of Turbopack
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
