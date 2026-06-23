export const LIVE_CLIENT_URL = 'https://weblixtheme.com';
export const LIVE_API_URL = 'https://weblix-theme.onrender.com';

export function clientUrl() {
  return process.env.CLIENT_URL || LIVE_CLIENT_URL;
}

export function apiPublicUrl() {
  return process.env.API_PUBLIC_URL || LIVE_API_URL;
}
