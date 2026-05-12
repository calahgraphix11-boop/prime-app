const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet' },
];

export const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
export const DEFAULT_REPORT_MODEL = 'claude-haiku-4-5-20251001';

async function callAnthropic(messages, model, system, maxTokens = 1024) {
  if (!API_KEY) throw new Error('Anthropic API key not configured');
  const body = { model, max_tokens: maxTokens, messages };
  if (system) body.system = system;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    const errBody = JSON.parse(bodyText || '{}');
    throw new Error(errBody?.error?.message || `API error: ${res.status}`);
  }
  const data = JSON.parse(bodyText);
  return data.content?.[0]?.text || '';
}

export async function generateContent(prompt, model = DEFAULT_REPORT_MODEL) {
  return callAnthropic([{ role: 'user', content: prompt }], model, null, 2048);
}

export async function rewriteReport(title, tone, content, model = DEFAULT_REPORT_MODEL) {
  const toneMap = {
    formal: 'formal, professional, and structured',
    academic: 'academic, scholarly, and research-oriented',
    casual: 'casual, conversational, and approachable',
  };
  const prompt = `Rewrite the following report content in a ${toneMap[tone] || 'formal'} tone.
Report Title: ${title}
Original Content: ${content}

Provide a well-structured, polished rewrite. Return only the rewritten content.`;
  return generateContent(prompt, model);
}

export async function chatWithAssistant(messages, model = DEFAULT_MODEL, username) {
  const greeting = username ? `If this is the first message in the conversation, open with "Hey ${username}!" then go straight into your answer.` : '';
  const system = [
    'You are StudyPal, a study assistant.',
    greeting,
    'Only respond to what the user actually wrote. Do not assume, invent, or answer questions they did not ask. If they say "hi" or greet you, just greet them back and ask what they need help with — nothing else.',
    'Write in plain sentences, like a knowledgeable friend texting back. No emojis, no headers, no bullet templates, no placeholders like [answer] or [topic], no filler like "Sure!" or "Great question!".',
    'Keep replies to 2-4 sentences unless a detailed explanation is genuinely needed.',
  ].filter(Boolean).join(' ');

  return callAnthropic(
    messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
    model,
    system,
    1024
  );
}
