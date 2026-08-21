import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set([
  "commons.wikimedia.org",
  "upload.wikimedia.org",
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
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
