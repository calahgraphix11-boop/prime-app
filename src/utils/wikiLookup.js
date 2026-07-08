export async function wikiSummary(term) {
  const res = await fetch(
    `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page,
  };
}
