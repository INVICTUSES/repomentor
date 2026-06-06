import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
