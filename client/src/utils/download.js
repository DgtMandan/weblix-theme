import { api } from '../services/api.js';

export async function downloadProtectedFile(downloadUrl, fallbackName = 'weblix-download.zip') {
  const apiPath = downloadUrl.startsWith('/api') ? downloadUrl.replace('/api', '') : downloadUrl;
  const response = await api.get(apiPath, { responseType: 'blob' });
  const disposition = response.headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  const filename = filenameMatch?.[1] || fallbackName;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
