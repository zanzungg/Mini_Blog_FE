import { getPostsRequest } from './post.api.js';
import { getPostByIdRequest } from './post.api.js';

const ensureSuccess = (payload, fallback) => {
  if (payload?.status === 'success') {
    return payload.data;
  }

  const error = new Error(payload?.message || fallback);
  error.details = payload;
  throw error;
};

export const getPosts = async (params = {}) => {
  const { data } = await getPostsRequest(params);
  const payload = ensureSuccess(data, 'Unable to load posts');

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};

export const getPostById = async (id) => {
  const { data } = await getPostByIdRequest(id);
  const payload = ensureSuccess(data, 'Unable to load post details');
  return payload.post || null;
};
