import { useState, useEffect } from 'react';
import { getDailyQuote } from '../utils/dailyQuote';

export default function QuoteCard() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    getDailyQuote().then(setQuote).catch(() => setQuote(null));
  }, []);

  if (!quote) return null;

  return (
    <div className="rounded-2xl p-4 backdrop-blur-md bg-white/10 border border-white/20">
      <p className="text-sm italic">"{quote.text}"</p>
      <p className="text-xs mt-1 opacity-70">— {quote.author}</p>
    </div>
  );
}
