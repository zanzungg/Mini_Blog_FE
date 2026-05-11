import { updateUserRequest } from './user.api.js';
import { getAuthState } from '../../core/store.js';

const ensureSuccess = (payload, fallback) => {
  if (payload?.status === 'success') {
    return payload.data;
  }

  const error = new Error(payload?.message || fallback);
  error.details = payload;
  throw error;
};

export const updateUserProfile = async ({ id, name }) => {
  const { accessToken } = getAuthState();

  const { data } = await updateUserRequest(
    id,
    {
      name,
    },
    accessToken
  );

  const payload = ensureSuccess(data, 'Unable to update profile');
  return payload.user || null;
};
