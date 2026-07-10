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

// FileReader's onerror hands back a raw Event (not an Error), and reader.error
// is a DOMException — rejecting with either crashes callers that expect a
// real Error. Always normalize to `new Error(...)` here.
function readerErrorToError(reader, fallbackMessage) {
  const message = reader.error?.message || fallbackMessage;
  return new Error(message);
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(readerErrorToError(reader, 'Could not read the file from disk.'));
    reader.readAsDataURL(file);
  });
}

function truncateTo3000Words(text) {
  const words = text.trim().split(/\s+/);
  return words.length <= 3000 ? text : words.slice(0, 3000).join(' ');
}

// Real .docx files are zip archives, which always start with the "PK" magic
// bytes (0x50 0x4B). A .doc file renamed to .docx (or a corrupted file) won't.
async function hasDocxZipSignature(file) {
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return header[0] === 0x50 && header[1] === 0x4b;
}

// Defensive: this only ever logs, it must never itself throw and take down
// the caller (e.g. if `error` is a weird cross-realm object with a throwing getter).
function safeLogError(context, error) {
  try {
    console.error(`[fileUtils] ${context}:`, error?.message || error);
  } catch {
    // ignore — logging must never crash the caller
  }
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
    if (!(await hasDocxZipSignature(file))) {
      throw new Error(
        "This looks like an older .doc file, not .docx. Please save it as .docx in Word and try again."
      );
    }
    let arrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (err) {
      safeLogError('failed to read .docx file into memory', err);
      throw new Error('Could not read the file from disk. Please try re-uploading it.');
    }
    try {
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      return { type: 'text', text: truncateTo3000Words(value) };
    } catch (err) {
      safeLogError('mammoth failed to extract text from .docx', err);
      throw new Error(
        'This .docx file appears to be corrupted or unreadable. Please try re-saving it in Word and uploading again.'
      );
    }
  }

  if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ type: 'text', text: truncateTo3000Words(reader.result) });
      reader.onerror = () => reject(readerErrorToError(reader, 'Could not read the text file from disk.'));
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
    reader.onerror = () => reject(readerErrorToError(reader, 'Could not read the text file from disk.'));
    reader.readAsText(file);
  });
}
