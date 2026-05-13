import { requestJson } from '../../utils/helpers.js';

const buildCommentsQuery = (params = {}) => {
  const query = new URLSearchParams();

  if (params.page !== undefined && params.page !== null) {
    query.set('page', String(params.page));
  }
  if (params.limit !== undefined && params.limit !== null) {
    query.set('limit', String(params.limit));
  }
  if (params.post_id !== undefined && params.post_id !== null) {
    query.set('post_id', String(params.post_id));
  }
  if (params.user_id !== undefined && params.user_id !== null) {
    query.set('user_id', String(params.user_id));
  }
  if (params.parent_id !== undefined && params.parent_id !== null) {
    query.set('parent_id', String(params.parent_id));
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getCommentsRequest = (params = {}) =>
  requestJson(`/comments${buildCommentsQuery(params)}`);

export const createCommentRequest = (payload, accessToken) =>
  requestJson('/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

export const updateCommentRequest = (id, payload, accessToken) =>
  requestJson(`/comments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

export const deleteCommentRequest = (id, accessToken) =>
  requestJson(`/comments/${id}`, {
    method: 'DELETE',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
