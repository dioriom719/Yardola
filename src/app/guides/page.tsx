import Link from "next/link";
import Image from "next/image";
import { PageBreadcrumbs } from "@/components/yardola/page-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";
import { listGuides } from "@/lib/data/guides";

export const metadata = {
  title: "Yardola Guide | Backyard Project Advice",
};

export default async function GuidesPage() {
  const guides = await listGuides();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Guides" }]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Yardola Guide
        </h1>
        <p className="text-muted-foreground mt-3">
          Ideas, advice, and planning tips for backyard projects in Las Vegas.
        </p>
      </div>

      <div className="mt-10">
        {guides.length === 0 ? (
          <EmptyState icon={BookOpen} title="No guides published yet" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {guide.featuredImageUrl && (
                  <div className="bg-muted relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={guide.featuredImageUrl}
                      alt={guide.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="p-4">
                  {guide.categoryName && (
                    <span className="text-primary text-xs font-medium tracking-wide uppercase">
                      {guide.categoryName}
                    </span>
                  )}
                  <h2 className="font-display text-foreground mt-1 text-lg">
                    {guide.title}
                  </h2>
                  {guide.excerpt && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {guide.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
