import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // NOTE: `search` is deliberately omitted on every pattern. When omitted
      // it means `**` (any query string); setting it to "" would BLOCK query
      // strings — and every Firebase Storage download URL carries
      // `?alt=media&token=…` while every CoinGecko icon carries a cachebuster.
      // Pinning `search` would 400 every image on the site.
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
      // Current CoinGecko asset host.
      { protocol: "https", hostname: "coin-images.coingecko.com", pathname: "/coins/images/**" },
      // Legacy host still returned by some CoinGecko endpoints.
      { protocol: "https", hostname: "assets.coingecko.com", pathname: "/coins/images/**" },
    ],
    // Required as of Next 16. We only ever request the default quality, and
    // widening this would let crawlers generate extra derivatives.
    qualities: [75],
    // WebP only: AVIF encoding is roughly an order of magnitude slower, and the
    // optimizer shares a single vCPU with SSR on Firebase App Hosting.
    formats: ["image/webp"],
    // 7 days. The optimized-image cache lives in `<distDir>/cache/images`,
    // which on Cloud Run is tmpfs and counts against the instance memory limit,
    // so a longer TTL trades RAM for CPU. The CDN in front absorbs most hits.
    minimumCacheTTL: 604800,
    // Trimmed from the default, which tops out at 2048/3840. The widest image
    // slot on the site is a ~760px article column, so those two sizes were
    // pure waste — and worse, the non-srcset `src` fallback pointed at 3840w.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 20, 32, 48, 64, 96],
  },

  async redirects() {
    // `/page/1` and the bare listing path would otherwise be two URLs for the
    // same content. Page 1 canonically lives at the bare path.
    return [
      {
        source: "/category/:category/page/1",
        destination: "/category/:category",
        permanent: true,
      },
      {
        source: "/tag/:tag/page/1",
        destination: "/tag/:tag",
        permanent: true,
      },
      {
        source: "/archive/:year/:month/page/1",
        destination: "/archive/:year/:month",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
