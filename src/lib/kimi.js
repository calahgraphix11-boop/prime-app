const KIMI_API_KEY = import.meta.env.VITE_KIMI_API_KEY;
const KIMI_BASE_URL = 'https://api.moonshot.ai/v1';
const KIMI_MODEL = 'kimi-k2-5';

export async function kimiGenerate({ systemPrompt, userPrompt, temperature = 0.6 }) {
  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`Kimi API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}
