/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for the Docker deployment (Dockerfile at repo
  // root) -- a self-contained server bundle, no full node_modules needed
  // in the runtime image.
  output: "standalone",
};

export default nextConfig;
