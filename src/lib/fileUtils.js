import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

export const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.docx';
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
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
    return pageTexts.join('\n');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
