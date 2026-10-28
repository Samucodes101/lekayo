/** @type {import('next').NextConfig} */
const nextConfig = {
  // The production server doesn't have the memory to lint + type-check inside
  // `next build` (it OOMs). Run `npm run typecheck` and `npm run lint` locally or
  // in CI before deploying instead.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {        
        serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: ["lekayo.com", "www.lekayo.com"],
    },
  },
}

export default nextConfig