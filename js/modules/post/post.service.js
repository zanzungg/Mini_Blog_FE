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
import { t } from '../../utils/i18n.js';

export const getPosts = async (params = {}) => {
  const { data } = await getPostsRequest(params);

  const payload = ensureSuccess(data, t('posts.unableLoadPosts'));

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};

export const getPostById = async (id) => {
  const { data } = await getPostByIdRequest(id);

  const payload = ensureSuccess(data, t('posts.unableLoadPostDetails'));

  return payload.post || null;
};

export const getMyPosts = async (params = {}) => {
  const { data } = await getMyPostsRequest(params);

  const payload = ensureSuccess(data, t('myPosts.unableLoadYourPosts'));

  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};

export const createPost = async (payload) => {
  const { data } = await createPostRequest(payload);

  const result = ensureSuccess(data, t('myPosts.saveFailed'));

  return result.post || null;
};

export const updatePost = async (id, payload) => {
  const { data } = await updatePostRequest(id, payload);

  const result = ensureSuccess(data, t('myPosts.saveFailed'));

  return result.post || null;
};

export const publishPost = async (id) => {
  const { data } = await publishPostRequest(id);

  const result = ensureSuccess(data, t('myPosts.publishFailed'));

  return result.post || null;
};

export const deletePost = async (id) => {
  const { data } = await deletePostRequest(id);

  const result = ensureSuccess(data, t('myPosts.deleteFailed'));

  return result.success || false;
};
