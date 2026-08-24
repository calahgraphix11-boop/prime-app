export async function wikiSummary(term, lang = 'en') {
  const domain = lang === 'fr' ? 'fr.wikipedia.org' : 'en.wikipedia.org';
  const searchRes = await fetch(
    `https://${domain}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      term
    )}&format=json&origin=*`
  );
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  const resolvedTitle = searchData?.query?.search?.[0]?.title;
  if (!resolvedTitle) return null;

  const res = await fetch(
    `https://${domain}/api/rest_v1/page/summary/${encodeURIComponent(resolvedTitle)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page,
  };
}
