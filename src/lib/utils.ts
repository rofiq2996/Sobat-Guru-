import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // Google Drive file link formats:
  // 1. https://drive.google.com/file/d/FILE_ID/view...
  // 2. https://drive.google.com/open?id=FILE_ID...
  // 3. https://docs.google.com/file/d/FILE_ID/...
  // 4. https://drive.google.com/uc?id=FILE_ID
  
  let fileId = '';
  
  if (url.includes('drive.google.com/file/d/')) {
    const parts = url.split('drive.google.com/file/d/');
    if (parts.length > 1) {
      fileId = parts[1].split('/')[0];
    }
  } else if (url.includes('docs.google.com/file/d/')) {
    const parts = url.split('docs.google.com/file/d/');
    if (parts.length > 1) {
      fileId = parts[1].split('/')[0];
    }
  } else if (url.includes('drive.google.com/open?id=')) {
    const parts = url.split('drive.google.com/open?id=');
    if (parts.length > 1) {
      fileId = parts[1].split('&')[0];
    }
  } else if (url.includes('drive.google.com/uc?id=')) {
    const parts = url.split('drive.google.com/uc?id=');
    if (parts.length > 1) {
      fileId = parts[1].split('&')[0];
    }
  } else if (url.includes('drive.google.com/uc?export=download&id=')) {
    const parts = url.split('drive.google.com/uc?export=download&id=');
    if (parts.length > 1) {
      fileId = parts[1].split('&')[0];
    }
  }
  
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  return url;
}
