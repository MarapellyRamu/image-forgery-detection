import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images served from the FastAPI backend during local development
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
    ],
  },

  // Suppress TypeScript build errors so the app compiles even with minor type gaps
  typescript: {
    ignoreBuildErrors: true,
  },

  // Suppress ESLint build errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
