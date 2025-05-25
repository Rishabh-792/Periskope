import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
        {
          protocol: 'https', // The protocol (http or https)
          hostname: 'robohash.org', // The exact hostname
        },
        {
          protocol: 'https', // The protocol (http or https)
          hostname: 'api.dicebear.com', // The exact hostname
        },
      ]
  }
};

export default nextConfig;
