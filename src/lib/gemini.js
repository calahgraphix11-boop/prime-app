import { supabase } from "./supabase";

export const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet' },
];

export const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

const SUPPORT_SYSTEM = "You are Prime's friendly support assistant. You help students with questions about the Prime app. Prime is a student productivity app with these features: StudyPal AI chat, Note Summarizer, Study Sessions with Pomodoro timer, Analytics dashboard, and Course Manager. New users get a 7-day free trial with no daily limits — the trial applies to both the Basic (2,499 FCFA/mo) and Pro (4,999 FCFA/mo) plans. After the trial ends, daily limits apply: 10 chats and 5 note summaries per day. To remove limits, users can upgrade to Basic (2,499 FCFA/mo) or Pro (4,999 FCFA/mo). Payments are made via MTN Mobile Money or Orange Money — no credit card needed. For payment or account issues you cannot resolve, tell the user to contact the team on WhatsApp. Be concise, friendly, and helpful. Do not answer questions unrelated to the app.";

// Appended to every system prompt so the model answers in the app's active
// language. English is the model's default, so only French needs forcing.
const FRENCH_DIRECTIVE =
  "Répondez TOUJOURS en français, quelle que soit la langue utilisée par l'étudiant(e). Utilisez un français naturel et courant, adapté à un(e) étudiant(e) camerounais(e).";

function withLang(systemPrompt, lang) {
  return lang === 'fr' ? `${systemPrompt}

${FRENCH_DIRECTIVE}` : systemPrompt;
}

export async function supportChat(messages, lang = 'en') {
  const apiMessages = messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/support-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages: apiMessages, systemPrompt: withLang(SUPPORT_SYSTEM, lang) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Support chat request failed');
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

function buildAnthropicFileBlock(file) {
  const { base64, mediaType } = file;
  if (mediaType.startsWith('image/')) {
    return { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };
  }
  if (mediaType === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } };
  }
  if (mediaType === 'text/plain') {
    return { type: 'document', source: { type: 'text', data: atob(base64) } };
  }
  return null; // DOCX and other types unsupported inline
}

export async function chatWithAssistant(messages, model = DEFAULT_MODEL, username, fileAttachment, lang = 'en') {
  const openWith = lang === 'fr' ? `Salut ${username} !` : `Hey ${username}!`;
  const greeting = username ? `If this is the first message in the conversation, open with "${openWith}" then go straight into your answer.` : '';
  const baseSystem = [
    'You are StudyPal, a study assistant.',
    greeting,
    'Only respond to what the user actually wrote. Do not assume, invent, or answer questions they did not ask. If they say "hi" or greet you, just greet them back and ask what they need help with — nothing else.',
    'Write in plain sentences, like a knowledgeable friend texting back. No emojis, no headers, no bullet templates, no placeholders like [answer] or [topic], no filler like "Sure!" or "Great question!".',
    'Keep replies to 2-4 sentences unless a detailed explanation is genuinely needed.',
  ].filter(Boolean).join(' ');
  const system = withLang(baseSystem, lang);

  const apiMessages = messages.map((m, idx) => {
    const role = m.role === 'user' ? 'user' : 'assistant';
    const isLast = idx === messages.length - 1;

    if (isLast && role === 'user' && fileAttachment) {
      const content = [];
      if (m.content) content.push({ type: 'text', text: m.content });
      const fileBlock = buildAnthropicFileBlock(fileAttachment);
      if (fileBlock) content.push(fileBlock);
      return { role, content: content.length > 0 ? content : m.content };
    }

    return { role, content: m.content };
  });

  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/studypal-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages: apiMessages, systemPrompt: system }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'StudyPal request failed');
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

export async function generateWithFile({ systemPrompt, userPrompt, referenceText, fileBlock, lang = 'en' }) {
  const text = referenceText
    ? `${userPrompt || ''}\n\nReference material:\n${referenceText}`
    : (userPrompt || '');
  const content = fileBlock ? [{ type: 'text', text }, fileBlock] : text;
  const messages = [{ role: 'user', content }];
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/note-summarizer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages, systemPrompt: withLang(systemPrompt, lang) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Note Summarizer request failed');
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

const MC_SYSTEM_PROMPT =
  "You are a university exam writer. Using the topic and any reference material as SOURCE KNOWLEDGE, write ORIGINAL multiple-choice questions a real lecturer would set. Never copy sentences from the reference — understand it, then create new questions testing real understanding. Wrong options must be plausible and tempting (common misconceptions), not obviously wrong. Match difficulty: Easy = recall, Medium = application, Hard = analysis and tricky distractors. Return ONLY a valid JSON array, no markdown or backticks. Each object: question (string), options (array of exactly 4 strings labeled A. B. C. D.), correct (string matching one option exactly), explanation (string, one sentence on why it's right).";

const STRUCTURED_SYSTEM_PROMPT =
  "You are a university exam writer. Using the topic and reference material as source knowledge, write ORIGINAL exam questions a lecturer would set — never copy sentences from the material. For each answer, write a clear model answer that is MID-LENGTH: enough to fully answer, never padded. Aim for 3 to 5 sentences for most questions, scaling slightly with the marks. Structure answers for easy reading — use short paragraphs or brief bullet points for multi-part answers, not one dense block. Be direct and clear, like a top student's exam answer, not a textbook excerpt. Return ONLY a valid JSON array, no markdown or backticks. Each object: question (string), answer (string — concise, well-structured model answer), marks (number).";

export async function examCoach({ systemPrompt, userPrompt, referenceText, fileBlock, questionType, lang = 'en' }) {
  if (questionType === "Structured") systemPrompt = STRUCTURED_SYSTEM_PROMPT;
  else if (!systemPrompt) systemPrompt = MC_SYSTEM_PROMPT;
  systemPrompt = withLang(systemPrompt, lang);
  const text = referenceText
    ? `${userPrompt || ''}\n\nReference material:\n${referenceText}`
    : (userPrompt || '');
  const content = fileBlock ? [{ type: 'text', text }, fileBlock] : text;
  const messages = [{ role: 'user', content }];
  console.log('[exam-coach] messages:', JSON.stringify(messages, null, 2));
  console.log('[exam-coach] systemPrompt:', systemPrompt);
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/exam-coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  const bodyText = await res.text();
  console.log('[exam-coach] response status:', res.status);
  console.log('[exam-coach] response body:', bodyText);
  if (!res.ok) {
    const err = JSON.parse(bodyText || '{}');
    throw new Error(err.error || 'Exam Coach request failed');
  }
  const data = JSON.parse(bodyText);
  const responseText = data.content?.[0]?.text ?? '';
  return responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}
