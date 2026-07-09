export async function wikiSummary(term) {
  const searchRes = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      term
    )}&format=json&origin=*`
  );
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  const resolvedTitle = searchData?.query?.search?.[0]?.title;
  if (!resolvedTitle) return null;

  const res = await fetch(
    `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(resolvedTitle)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page,
  };
}
