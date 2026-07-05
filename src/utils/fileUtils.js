export function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(b)) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(
    new Date(isoString)
  );
}

export function getFileType(mimeType = '', name = '') {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (mimeType.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) return 'word';
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  )
    return 'excel';
  if (
    mimeType.includes('presentation') ||
    ['ppt', 'pptx'].includes(ext)
  )
    return 'ppt';
  if (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
  )
    return 'image';
  if (
    mimeType.startsWith('video/') ||
    ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)
  )
    return 'video';
  if (
    mimeType.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'flac'].includes(ext)
  )
    return 'audio';
  if (
    mimeType.includes('zip') ||
    mimeType.includes('compressed') ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)
  )
    return 'zip';
  return 'file';
}

export const FILE_TYPE_STYLES = {
  pdf:   { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     label: 'PDF' },
  word:  { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    label: 'Word' },
  excel: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Excel' },
  ppt:   { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  label: 'PPT' },
  image: { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  label: 'Imagen' },
  video: { bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    text: 'text-pink-400',    label: 'Video' },
  audio: { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  text: 'text-yellow-400',  label: 'Audio' },
  zip:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   label: 'Archivo' },
  file:  { bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   text: 'text-slate-400',   label: 'Archivo' },
};
