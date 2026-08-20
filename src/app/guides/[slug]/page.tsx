import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageBreadcrumbs } from "@/components/yardola/page-breadcrumbs";
import { getGuideBySlug, listRelatedGuides } from "@/lib/data/guides";

export async function generateMetadata(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Yardola" };
  return { title: `${guide.title} | Yardola Guide` };
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const relatedGuides = await listRelatedGuides(guide.slug, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <div className="mt-4">
        {guide.categoryName && (
          <span className="text-primary text-xs font-medium tracking-wide uppercase">
            {guide.categoryName}
          </span>
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
