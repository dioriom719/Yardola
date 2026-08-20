import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectGrid } from "@/components/yardola/project-grid";
import { BusinessGrid } from "@/components/yardola/business-grid";
import { getGuideBySlug, listRelatedGuides } from "@/lib/data/guides";
import { getCategoryBySlug } from "@/lib/data/categories";
import { listProjects } from "@/lib/data/projects";
import { listBusinesses } from "@/lib/data/businesses";
import { generateGuideMetadata } from "@/lib/seo/metadata";
import { getGuideIndexability } from "@/lib/seo/indexability";
import { buildArticleJsonLd } from "@/lib/seo/structured-data";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/guides/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = await getGuideBySlug(slug);
  if (!guide)
    return { title: "YARDOLO", robots: { index: false, follow: true } };
  return generateGuideMetadata(guide, getGuideIndexability(guide).index);
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const category = guide.categorySlug
    ? await getCategoryBySlug(guide.categorySlug)
    : null;

  const [relatedGuides, relatedProjects, relatedBusinesses] = await Promise.all(
    [
      listRelatedGuides(guide.slug, { categoryId: category?.id, limit: 3 }),
      category
        ? listProjects({ categorySlug: category.slug }, 1, 3).then(
            (r) => r.items
          )
        : Promise.resolve([]),
      category
        ? listBusinesses({ categorySlug: category.slug }, 1, 3).then(
            (r) => r.items
          )
        : Promise.resolve([]),
    ]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={buildArticleJsonLd(guide)} />
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <div className="mt-4">
        {guide.categoryName && (
          <Link
            href={category ? `/projects/${category.slug}` : "/guides"}
            className="text-primary text-xs font-medium tracking-wide uppercase hover:underline"
          >
            {guide.categoryName}
          </Link>
        )}
        <h1 className="font-display text-foreground mt-1 text-3xl sm:text-4xl">
          {guide.title}
        </h1>
        {guide.excerpt && (
          <p className="text-muted-foreground mt-3 text-lg">{guide.excerpt}</p>
        )}
      </div>

      {guide.featuredImageUrl && (
        <div className="bg-muted relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={guide.featuredImageUrl}
            alt={guide.title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {guide.content && (
        <div className="mt-8 space-y-4">
          {guide.content
            .split(/\n\n+/)
            .filter(Boolean)
            .map((block, index) =>
              block.startsWith("# ") ? (
                <h2
                  key={index}
                  className="font-display text-foreground text-2xl"
                >
                  {block.slice(2)}
                </h2>
              ) : (
                <p key={index} className="text-muted-foreground">
                  {block}
                </p>
              )
            )}
        </div>
      )}

      {relatedProjects.length > 0 && category && (
        <section className="border-border mt-16 border-t pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-foreground text-xl">
              {category.name} projects for inspiration
            </h2>
            <Link
              href={`/projects/${category.slug}`}
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProjectGrid projects={relatedProjects} />
          </div>
        </section>
      )}

      {relatedBusinesses.length > 0 && category && (
        <section className="border-border mt-16 border-t pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-foreground text-xl">
              Professionals for {category.name.toLowerCase()}
            </h2>
            <Link
              href="/professionals"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <BusinessGrid businesses={relatedBusinesses} />
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="border-border mt-16 border-t pt-10">
          <h2 className="font-display text-foreground text-xl">More guides</h2>
          <ul className="mt-4 space-y-3">
            {relatedGuides.map((related) => (
              <li key={related.id}>
                <Link
                  href={`/guides/${related.slug}`}
                  className="text-foreground hover:text-primary focus-visible:ring-ring underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
