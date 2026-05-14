import { requestJson } from '../../utils/helpers.js';

export const updateUserRequest = (id, payload) => {
  const { id: _, ...dataToSend } = payload;

  return requestJson(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dataToSend),
  });
};
