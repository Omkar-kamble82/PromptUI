import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@/generated/prisma/client"],
};

export default nextConfig;
