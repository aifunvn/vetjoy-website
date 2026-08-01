/**
 * `data` must always come from server-side/internal config or content — never
 * from raw user input — since this is rendered via dangerouslySetInnerHTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
