import { getCategoriesRequest } from './category.api.js';
import { ensureSuccess } from '../../utils/api-response.js';

export const getCategories = async (params = {}) => {
  const { data } = await getCategoriesRequest(params);
  const payload = ensureSuccess(data, 'Unable to load categories');

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};
