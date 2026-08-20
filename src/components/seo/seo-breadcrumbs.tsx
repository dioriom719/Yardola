import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import {
  PageBreadcrumbs,
  type BreadcrumbEntry,
} from "@/components/yardola/page-breadcrumbs";

interface SeoBreadcrumbsProps {
  items: BreadcrumbEntry[];
  className?: string;
}

/**
 * Renders the visible breadcrumb trail and its matching BreadcrumbList
 * JSON-LD from the same items array, so the two can never drift apart.
 * Use this instead of a bare <PageBreadcrumbs> on any indexable page.
 */
export function SeoBreadcrumbs({ items, className }: SeoBreadcrumbsProps) {
  return (
    <>
      <PageBreadcrumbs items={items} className={className} />
      <JsonLd data={buildBreadcrumbJsonLd(items)} />
    </>
  );
}
