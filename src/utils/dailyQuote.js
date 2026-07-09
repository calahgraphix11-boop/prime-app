import { supabase } from '../lib/supabase.js';

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
    const { data, error } = await supabase.functions.invoke('get-daily-quote');
    if (error || !data?.text) throw error || new Error('Empty quote response');
    const quote = { text: data.text, author: data.author };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, quote }));
    return quote;
  } catch {
    return FALLBACK;
  }
}
