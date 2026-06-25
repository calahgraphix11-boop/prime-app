import { supabase } from "./supabase";

export const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet' },
];

export const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
export const DEFAULT_REPORT_MODEL = 'claude-haiku-4-5-20251001';


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
  const messages = [{ role: 'user', content: prompt }];
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/report-writer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages, systemPrompt: null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Report Writer request failed');
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

const SUPPORT_SYSTEM = "You are Prime's friendly support assistant. You help students with questions about the Prime app. Prime is a student productivity app with these features: StudyPal AI chat, AI Report Writer, Note Summarizer, Study Sessions with Pomodoro timer, Analytics dashboard, and Course Manager. New users get a 7-day free trial with no daily limits — the trial applies to both the Basic (2,500 FCFA/mo) and Pro (5,000 FCFA/mo) plans. After the trial ends, daily limits apply: 10 chats, 5 report rewrites, and 5 note summaries per day. To remove limits, users can upgrade to Basic (2,500 FCFA/mo) or Pro (5,000 FCFA/mo). Payments are made via MTN Mobile Money or Orange Money — no credit card needed. For payment or account issues you cannot resolve, tell the user to contact the team on WhatsApp. Be concise, friendly, and helpful. Do not answer questions unrelated to the app.";

export async function supportChat(messages) {
  const apiMessages = messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/support-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages: apiMessages, systemPrompt: SUPPORT_SYSTEM }),
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

export async function chatWithAssistant(messages, model = DEFAULT_MODEL, username, fileAttachment) {
  const greeting = username ? `If this is the first message in the conversation, open with "Hey ${username}!" then go straight into your answer.` : '';
  const system = [
    'You are StudyPal, a study assistant.',
    greeting,
    'Only respond to what the user actually wrote. Do not assume, invent, or answer questions they did not ask. If they say "hi" or greet you, just greet them back and ask what they need help with — nothing else.',
    'Write in plain sentences, like a knowledgeable friend texting back. No emojis, no headers, no bullet templates, no placeholders like [answer] or [topic], no filler like "Sure!" or "Great question!".',
    'Keep replies to 2-4 sentences unless a detailed explanation is genuinely needed.',
  ].filter(Boolean).join(' ');

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

export async function generateWithFile({ systemPrompt, userPrompt, referenceText }) {
  let msgContent = userPrompt || '';
  if (referenceText) msgContent += `\n\nReference material:\n${referenceText}`;
  const messages = [{ role: 'user', content: msgContent }];
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/note-summarizer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Note Summarizer request failed');
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

const MC_SYSTEM_PROMPT =
  "You are an exam preparation assistant. Return ONLY a valid JSON array with no markdown or backticks. Each object must have: question (string), options (array of exactly 4 strings labeled A. B. C. D.), correct (string matching one of the options exactly), explanation (string, one sentence max).";

const STRUCTURED_SYSTEM_PROMPT =
  "You are an exam preparation assistant. Return ONLY a valid JSON array with no markdown or backticks. Each object must have: question (string), answer (string — a detailed paragraph answer), marks (number — suggested mark allocation).";

export async function examCoach({ systemPrompt, userPrompt, referenceText, questionType }) {
  if (questionType === "Structured") systemPrompt = STRUCTURED_SYSTEM_PROMPT;
  else if (!systemPrompt) systemPrompt = MC_SYSTEM_PROMPT;
  let msgContent = userPrompt || '';
  if (referenceText) msgContent += `\n\nReference material:\n${referenceText}`;
  const messages = [{ role: 'user', content: msgContent }];
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
  const text = data.content?.[0]?.text ?? '';
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}
