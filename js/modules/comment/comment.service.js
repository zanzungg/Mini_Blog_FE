import {
  createCommentRequest,
  updateCommentRequest,
  deleteCommentRequest,
} from './comment.api.js';

import { ensureSuccess } from '../../utils/api-response.js';

export const createComment = async ({ content, postId, parentId }) => {
  const body = {
    content,
    postId,
  };

  if (parentId !== undefined && parentId !== null) {
    body.parentId = parentId;
  }

  const { data } = await createCommentRequest(body);

  const result = ensureSuccess(data, 'Unable to create comment');

  return result.comment || null;
};

export const updateComment = async (id, { content }) => {
  const { data } = await updateCommentRequest(id, {
    content,
  });

  const result = ensureSuccess(data, 'Unable to update comment');

  return result.comment || null;
};

export const deleteComment = async (id) => {
  const { data } = await deleteCommentRequest(id);

  const result = ensureSuccess(data, 'Unable to delete comment');

  return result.success || false;
};
