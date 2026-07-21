import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch (error) {
    return dateStr;
  }
}

export function formatConfidence(confidence: number) {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function getResultColor(result: string) {
  return result.toUpperCase() === 'AUTHENTIC' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20';
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
