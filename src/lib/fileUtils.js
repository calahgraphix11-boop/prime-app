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
