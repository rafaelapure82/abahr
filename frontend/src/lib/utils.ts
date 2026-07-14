export const getAvatarUrl = (url: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const uploadsBase = API_URL.replace('/api/v1', '/uploads');
  return `${uploadsBase}/${url}`;
};
