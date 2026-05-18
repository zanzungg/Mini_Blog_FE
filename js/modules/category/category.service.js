import { getCategoriesRequest } from './category.api.js';
import { ensureSuccess } from '../../utils/api-response.js';
import { t } from '../../utils/i18n.js';

export const getCategories = async (params = {}) => {
  const { data } = await getCategoriesRequest(params);
  const payload = ensureSuccess(data, t('errors.unableLoadCategories'));

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};
