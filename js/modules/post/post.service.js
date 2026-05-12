import {
  getPostsRequest,
  getPostByIdRequest,
  getMyPostsRequest,
  createPostRequest,
  updatePostRequest,
  publishPostRequest,
} from './post.api.js';
import { getAuthState } from '../../core/store.js';

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

export const getMyPosts = async (params = {}) => {
  const { accessToken } = getAuthState();
  const { data } = await getMyPostsRequest(params, accessToken);
  const payload = ensureSuccess(data, 'Unable to load your posts');

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};

export const createPost = async (payload) => {
  const { accessToken } = getAuthState();
  const { data } = await createPostRequest(payload, accessToken);
  const result = ensureSuccess(data, 'Unable to create post');
  return result.post || null;
};

export const updatePost = async (id, payload) => {
  const { accessToken } = getAuthState();
  const { data } = await updatePostRequest(id, payload, accessToken);
  const result = ensureSuccess(data, 'Unable to update post');
  return result.post || null;
};

export const publishPost = async (id) => {
  const { accessToken } = getAuthState();
  const { data } = await publishPostRequest(id, accessToken);
  const result = ensureSuccess(data, 'Unable to publish post');
  return result.post || null;
};
