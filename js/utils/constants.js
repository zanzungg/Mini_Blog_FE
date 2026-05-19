export const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return apiUrl || window.location.origin;
};
export const AUTH_STORAGE_KEY = 'mini_blog_auth';
export const LOCALE_STORAGE_KEY = 'mini_blog_locale';
export const MAINTENANCE_HASH = '#/maintenance';
export const MAINTENANCE_MESSAGE_KEY = 'mini_blog_maintenance_message';
