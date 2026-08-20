import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}

/** Plain Link-based pagination -- no client JS required. */
export function Pagination({ page, pageCount, buildHref }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = getPageWindow(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      <PageLink
        href={page > 1 ? buildHref(page - 1) : undefined}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </PageLink>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="text-muted-foreground px-2 text-sm"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <PageLink
            key={entry}
            href={entry === page ? undefined : buildHref(entry)}
            current={entry === page}
          >
            {entry}
          </PageLink>
        )
      )}

      <PageLink
        href={page < pageCount ? buildHref(page + 1) : undefined}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  current,
  children,
  ...props
}: {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className = cn(
    "flex size-9 items-center justify-center rounded-md text-sm transition-colors",
    current
      ? "bg-primary text-primary-foreground"
      : href
        ? "text-foreground hover:bg-muted"
        : "text-muted-foreground/40"
  );

  if (!href) {
    return (
      <span className={className} aria-current={current ? "page" : undefined}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

function getPageWindow(
  page: number,
  pageCount: number
): Array<number | "ellipsis"> {
  const result: Array<number | "ellipsis"> = [];
  const window = 1;

  for (let p = 1; p <= pageCount; p++) {
    const isEdge = p === 1 || p === pageCount;
    const isNearCurrent = Math.abs(p - page) <= window;
    if (isEdge || isNearCurrent) {
      result.push(p);
    } else if (result[result.length - 1] !== "ellipsis") {
      result.push("ellipsis");
    }
  }

  return result;
}
