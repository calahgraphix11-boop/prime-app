import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

export const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg,.webp,.docx,.txt';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function getMediaType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return (
    {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      txt: 'text/plain',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }[ext] || 'application/octet-stream'
  );
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (event) => {
      const domErr = event?.target?.error;
      console.error('[readFileAsBase64] FileReader error:', domErr?.name, domErr?.message, domErr?.code, event);
      reject(domErr || event);
    };
    reader.readAsDataURL(file);
  });
}

function truncateTo3000Words(text) {
  const words = text.trim().split(/\s+/);
  return words.length <= 3000 ? text : words.slice(0, 3000).join(' ');
}

// Returns { type: 'block', block } for PDF/images (diagrams preserved)
// or { type: 'text', text } for DOCX/TXT (text only, diagrams not included).
export async function prepareFileForAI(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    const base64 = await readFileAsBase64(file);
    return { type: 'block', block: { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } } };
  }

  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    const base64 = await readFileAsBase64(file);
    return { type: 'block', block: { type: 'image', source: { type: 'base64', media_type: getMediaType(file.name), data: base64 } } };
  }

  if (ext === 'docx') {
    console.log('[prepareFileForAI] DOCX: calling file.arrayBuffer(), size:', file.size);
    let arrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      console.log('[prepareFileForAI] DOCX: arrayBuffer ok, byteLength:', arrayBuffer.byteLength);
    } catch (err) {
      console.error('[prepareFileForAI] DOCX: file.arrayBuffer() threw:', err?.name, err?.message, err);
      throw err;
    }
    try {
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      console.log('[prepareFileForAI] DOCX: mammoth ok, text length:', value?.length);
      return { type: 'text', text: truncateTo3000Words(value) };
    } catch (err) {
      console.error('[prepareFileForAI] DOCX: mammoth.extractRawText threw:', err?.name, err?.message, err);
      throw err;
    }
  }

  if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ type: 'text', text: truncateTo3000Words(reader.result) });
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, image (PNG/JPG/JPEG/WEBP), DOCX, or TXT file.`);
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item) => item.str).join(' '));
    }
    return truncateTo3000Words(pageTexts.join('\n'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(truncateTo3000Words(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
