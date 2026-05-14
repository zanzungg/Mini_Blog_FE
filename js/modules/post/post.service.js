import {
  getPostsRequest,
  getPostByIdRequest,
  getMyPostsRequest,
  createPostRequest,
  updatePostRequest,
  publishPostRequest,
  deletePostRequest,
} from './post.api.js';

import { ensureSuccess } from '../../utils/api-response.js';

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
  const { data } = await getMyPostsRequest(params);

  const payload = ensureSuccess(data, 'Unable to load your posts');

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};

export const createPost = async (payload) => {
  const { data } = await createPostRequest(payload);

  const result = ensureSuccess(data, 'Unable to create post');

  return result.post || null;
};

export const updatePost = async (id, payload) => {
  const { data } = await updatePostRequest(id, payload);

  const result = ensureSuccess(data, 'Unable to update post');

  return result.post || null;
};

export const publishPost = async (id) => {
  const { data } = await publishPostRequest(id);

  const result = ensureSuccess(data, 'Unable to publish post');

  return result.post || null;
};

export const deletePost = async (id) => {
  const { data } = await deletePostRequest(id);

  const result = ensureSuccess(data, 'Unable to delete post');

  return result.success || false;
};
