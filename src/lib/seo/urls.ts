import { SITE_URL } from "@/lib/seo/config";

/** Builds an absolute, canonical-ready URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
