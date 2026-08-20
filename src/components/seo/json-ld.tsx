/**
 * Renders a JSON-LD structured data block. `JSON.stringify` output is
 * safe to embed in a <script> tag as-is EXCEPT for a literal `</script>`
 * sequence, which would terminate the tag early -- that's the one thing
 * escaped here.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
