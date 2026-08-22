import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set([
  "commons.wikimedia.org",
  "upload.wikimedia.org",
  // Dev/seed-data placeholder images (see supabase/seed.sql's
  // project_photos rows) -- without this, every real ProjectCard/
  // BusinessCard image on the current seed data 403s through this
  // proxy, since it predates this allowlist. next.config.ts's
  // remotePatterns already allows this host directly for the same
  // reason.
  "placehold.co",
]);

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) return new Response("Missing image URL", { status: 400 });

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response("Image host not allowed", { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: { Accept: "image/avif,image/webp,image/jpeg,image/png,image/*" },
    redirect: "follow",
    next: { revalidate: 86400 },
  });

  if (!upstream.ok) {
    return new Response("Unable to fetch image", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return new Response("Upstream is not an image", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
