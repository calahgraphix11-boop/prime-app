function decodeHtmlEntities(text) {
  if (typeof text !== "string") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export async function fetchTriviaQuestions(amount, category) {
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) url += `&category=${category}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const results = data?.results || [];

  return results.map((q) => ({
    ...q,
    category: decodeHtmlEntities(q.category),
    question: decodeHtmlEntities(q.question),
    correct_answer: decodeHtmlEntities(q.correct_answer),
    incorrect_answers: (q.incorrect_answers || []).map(decodeHtmlEntities),
  }));
}
