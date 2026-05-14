import { requestJson } from '../../utils/helpers.js';

const buildPostsQuery = (params = {}) => {
  const query = new URLSearchParams();

  if (params.page !== undefined && params.page !== null) {
    query.set('page', String(params.page));
  }

  if (params.limit !== undefined && params.limit !== null) {
    query.set('limit', String(params.limit));
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

export const getPostByIdRequest = (id) => requestJson(`/posts/${id}`);

export const getMyPostsRequest = (params = {}) =>
  requestJson(`/posts/me${buildPostsQuery(params)}`);

export const createPostRequest = (payload) =>
  requestJson('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePostRequest = (id, payload, accessToken) =>
  requestJson(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const publishPostRequest = (id) =>
  requestJson(`/posts/${id}/publish`, {
    method: 'POST',
  });

export const deletePostRequest = (id) =>
  requestJson(`/posts/${id}`, {
    method: 'DELETE',
  });
