import { requestJson } from '../../utils/helpers.js';

export const updateUserRequest = (id, payload, accessToken) => {
  const { id: _, ...dataToSend } = payload;

  return requestJson(`/users/${id}`, {
    method: 'PATCH',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: JSON.stringify(dataToSend),
  });
};
