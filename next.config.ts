import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/country/young-guard", destination: "/country/komsomol", permanent: true },
      { source: "/country/grey-ranks", destination: "/country/zmp", permanent: true },
      { source: "/country/fronte-gioventu", destination: "/country/gil", permanent: true },
      { source: "/country/yokusan-sonendan", destination: "/country/dai-nippon-seishonendan", permanent: true },
    ];
  },
};

export default nextConfig;
