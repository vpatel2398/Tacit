import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages must run server-side only, not bundled for the browser
  serverExternalPackages: [
    '@huggingface/transformers',
    'pdf-parse',
    'mammoth',
  ],
};

export default nextConfig;
