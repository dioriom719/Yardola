import type { NextConfig } from "next";

// Derived from the Supabase URL so both local dev (http://127.0.0.1:54321)
// and a real project (https://<ref>.supabase.co) work without editing this
// file per environment. Used for signed homeowner-upload photo URLs and
// (eventually) Supabase-hosted project photos.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Dev/seed-data placeholder images only. Production project
        // photos will be served from Supabase Storage.
        protocol: "https",
        hostname: "placehold.co",
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
