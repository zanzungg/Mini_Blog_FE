import { requestJson } from '../../utils/helpers.js';

export const createCommentRequest = (payload) =>
  requestJson('/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateCommentRequest = (id, payload) =>
  requestJson(`/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteCommentRequest = (id) =>
  requestJson(`/comments/${id}`, {
    method: 'DELETE',
  });
