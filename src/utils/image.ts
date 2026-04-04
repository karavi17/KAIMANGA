const PROXY_URL = 'http://localhost:3000/api/proxy-image?url=';

export const getImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    return `${PROXY_URL}${encodeURIComponent(url)}`;
  }
  return url;
};
