import { requestJson } from '../../utils/helpers.js';

const buildPostsQuery = (params = {}) => {
  const query = new URLSearchParams();

  if (params.page !== undefined && params.page !== null) {
    query.set('page', String(params.page));
  }

  if (params.limit !== undefined && params.limit !== null) {
    query.set('limit', String(params.limit));
  }

  if (params.status) {
    query.set('status', params.status);
  }

  if (params.user_id !== undefined && params.user_id !== null) {
    query.set('user_id', String(params.user_id));
  }

  if (params.category_id !== undefined && params.category_id !== null) {
    query.set('category_id', String(params.category_id));
  }

  if (params.keyword) {
    query.set('keyword', params.keyword);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getPostsRequest = (params = {}) =>
  requestJson(`/posts${buildPostsQuery(params)}`);
