import type { NextConfig } from "next";

// Derived from the Supabase URL so both local dev (http://127.0.0.1:54321)
// and a real project (https://<ref>.supabase.co) work without editing this
// file per environment. Used for signed homeowner-upload photo URLs and
// Supabase-hosted project photos.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Development placeholder images.
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        // Current preview catalog images use Wikimedia Commons' redirect
        // endpoint. Keep this explicit rather than allowing arbitrary hosts.
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:Redirect/file/**",
      },
      {
        // Wikimedia redirects ultimately resolve to this asset host.
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      ...(supabaseUrl
        ? [
            {
              protocol: supabaseUrl.protocol.replace(":", "") as
                "http" | "https",
              hostname: supabaseUrl.hostname,
              port: supabaseUrl.port || undefined,
              pathname: "/storage/v1/object/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
