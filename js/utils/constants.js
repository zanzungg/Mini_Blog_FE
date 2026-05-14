export const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return apiUrl || window.location.origin;
};
export const AUTH_STORAGE_KEY = 'mini_blog_auth';
