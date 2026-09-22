import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Recharts ships untranspiled ES2022 class static blocks and es5 class
  // syntax that breaks under the server bundle's SWC targets (the page-data
  // collection step crashed with "Super expression must either be null or a
  // function"). Transpiling it through the app's own SWC fixes that.
  transpilePackages: ["recharts", "victory-vendor"],
};

export default nextConfig;
