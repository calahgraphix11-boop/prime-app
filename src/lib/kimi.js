const KIMI_API_KEY = import.meta.env.VITE_KIMI_API_KEY;
const KIMI_BASE_URL = 'https://api.moonshot.ai/v1';
const KIMI_MODEL = 'kimi-k2-5';

function buildUserContent(userPrompt, file) {
  if (!file) return userPrompt;
  const { base64, mediaType, filename } = file;

  if (mediaType.startsWith('image/')) {
    return [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
    ];
  }

  if (mediaType === 'text/plain') {
    return `${userPrompt}\n\n[Attached file: ${filename}]\n${atob(base64)}`;
  }

  // PDF / DOCX — note the filename; full parsing would require the Files API
  return `${userPrompt}\n\n[Attached document: ${filename}]`;
}

export async function kimiGenerate({ systemPrompt, userPrompt, temperature = 0.6, file }) {
  const userContent = buildUserContent(userPrompt, file);

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Kimi API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}
