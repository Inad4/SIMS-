import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // basePath: "/api/v1/dashboard", // Set the base path to /dashboard
  assetPrefix: "/api/v1/dashboard/",
};

export default nextConfig;
