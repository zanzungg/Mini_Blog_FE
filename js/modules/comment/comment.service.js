import {
  getCommentsRequest,
  createCommentRequest,
  updateCommentRequest,
  deleteCommentRequest,
} from './comment.api.js';
import { getAuthState } from '../../core/store.js';

const ensureSuccess = (payload, fallback) => {
  if (payload?.status === 'success') {
    return payload.data;
  }
  const error = new Error(payload?.message || fallback);
  error.details = payload;
  throw error;
};

// Lấy comments theo postId — backend tự thread khi chỉ có post_id
export const getCommentsByPost = async (postId, params = {}) => {
  const { data } = await getCommentsRequest({ ...params, post_id: postId });
  const payload = ensureSuccess(data, 'Unable to load comments');
  return {
    items: payload.data || [],
    meta: payload.meta || null,
  };
};

export const createComment = async ({ content, postId, parentId }) => {
  const { accessToken } = getAuthState();
  const body = { content, postId };
  if (parentId !== undefined && parentId !== null) {
    body.parentId = parentId;
  }
  const { data } = await createCommentRequest(body, accessToken);
  const result = ensureSuccess(data, 'Unable to create comment');
  return result.comment || null;
};

export const updateComment = async (id, { content }) => {
  const { accessToken } = getAuthState();
  const { data } = await updateCommentRequest(id, { content }, accessToken);
  const result = ensureSuccess(data, 'Unable to update comment');
  return result.comment || null;
};

export const deleteComment = async (id) => {
  const { accessToken } = getAuthState();
  const { data } = await deleteCommentRequest(id, accessToken);
  const result = ensureSuccess(data, 'Unable to delete comment');
  return result.success || false;
};
