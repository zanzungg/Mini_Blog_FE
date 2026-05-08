import { getCategoriesRequest } from './category.api.js';

const ensureSuccess = (payload, fallback) => {
  if (payload?.status === 'success') {
    return payload.data;
  }

  const error = new Error(payload?.message || fallback);
  error.details = payload;
  throw error;
};

export const getCategories = async (params = {}) => {
  const { data } = await getCategoriesRequest(params);
  const payload = ensureSuccess(data, 'Unable to load categories');

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};
