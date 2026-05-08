import { requestJson } from '../../utils/helpers.js';

const buildCategoriesQuery = (params = {}) => {
  const query = new URLSearchParams();

  if (params.page !== undefined && params.page !== null) {
    query.set('page', String(params.page));
  }

  if (params.limit !== undefined && params.limit !== null) {
    query.set('limit', String(params.limit));
  }

  if (params.search) {
    query.set('search', params.search);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getCategoriesRequest = (params = {}) =>
  requestJson(`/categories${buildCategoriesQuery(params)}`);
