import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbEntry[];
  className?: string;
}

/** Consistent breadcrumb trail for section/detail pages. */
export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbFragment
            key={item.href ?? item.label}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbFragment({
  item,
  isLast,
}: {
  item: BreadcrumbEntry;
  isLast: boolean;
}) {
  return (
    <>
      <BreadcrumbItem>
        {item.href && !isLast ? (
          <BreadcrumbLink render={<Link href={item.href} />}>
            {item.label}
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage>{item.label}</BreadcrumbPage>
        )}
      </BreadcrumbItem>
      {!isLast && <BreadcrumbSeparator />}
    </>
  );
}
