import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  webpack(config) {
    config.resolve.extensionAlias = { ...(config.resolve.extensionAlias ?? {}), ".js": [".ts", ".tsx", ".js"] };
    return config;
  },
};
export default nextConfig;
