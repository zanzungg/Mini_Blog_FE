import { updateUserRequest } from './user.api.js';
import { ensureSuccess } from '../../utils/api-response.js';

export const updateUserProfile = async ({ id, name }) => {
  const { data } = await updateUserRequest(id, {
    name,
  });

  const payload = ensureSuccess(data, 'Unable to update profile');

  return payload.user || null;
};
