import { updateUserRequest } from './user.api.js';
import { ensureSuccess } from '../../utils/api-response.js';
import { t } from '../../utils/i18n.js';

export const updateUserProfile = async ({ id, name }) => {
  const { data } = await updateUserRequest(id, {
    name,
  });

  const payload = ensureSuccess(data, t('profile.updateFailed'));

  return payload.user || null;
};
