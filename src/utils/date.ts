/**
 * Utilitários de data usando o fuso horário local do dispositivo,
 * evitando desvios de dia causados por conversão UTC (toISOString).
 */

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

export function getLocalTimestampISO(date: Date = new Date()): string {
  const datePart = getLocalDateString(date);
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());
  return `${datePart}T${hours}:${minutes}:${seconds}`;
}

export function getLocalTimestampFilename(
  prefix: string = 'gamelog-backup',
  extension: string = 'json',
  date: Date = new Date()
): string {
  const datePart = getLocalDateString(date);
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());
  return `${prefix}-${datePart}-${hours}-${minutes}-${seconds}.${extension}`;
}

export function formatLocalDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
