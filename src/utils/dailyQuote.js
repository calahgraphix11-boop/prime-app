const CACHE_KEY = 'prime_daily_quote';

const FALLBACK = {
  text: 'Discipline is the bridge between goals and results.',
  author: 'Jim Rohn',
};

export async function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && cached.date === today) {
      return cached.quote;
    }
  } catch {}

  try {
    const res = await fetch('https://zenquotes.io/api/today');
    const data = await res.json();
    const quote = { text: data[0].q, author: data[0].a };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, quote }));
    return quote;
  } catch {
    return FALLBACK;
  }
}
