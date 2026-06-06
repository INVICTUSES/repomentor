import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_AUTH_ENABLED: String(
      !!(
        process.env.AUTH_SECRET &&
        process.env.AUTH_GITHUB_ID &&
        process.env.AUTH_GITHUB_SECRET
      )
    ),
  },
};

export default nextConfig;
