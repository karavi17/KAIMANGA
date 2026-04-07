const isProd = import.meta.env.PROD;
const API_ORIGIN = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/api\/manga\/?$/, '').replace(/\/$/, '') || 
                  (isProd ? '' : 'http://localhost:3000');
const PROXY_URL = `${API_ORIGIN}/api/proxy-image?url=`;

export const getImageUrl = (url: string | undefined) => {
  if (!url) return 'https://placehold.co/300x400?text=No+Cover';
  if (url.startsWith('http')) {
    return `${PROXY_URL}${encodeURIComponent(url)}`;
  }
  return url;
};
