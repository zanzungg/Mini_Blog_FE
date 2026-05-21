import { getMaintenanceStatusRequest } from './maintenance.api.js';
import { ensureSuccess } from '../../utils/api-response.js';
import { t } from '../../utils/i18n.js';
import {
  activateMaintenanceMode,
  deactivateMaintenanceMode,
} from '../../utils/maintenance-state.js';

export const checkMaintenanceStatus = async () => {
  const { data } = await getMaintenanceStatusRequest();
  const payload = ensureSuccess(data, t('maintenance.checkFailed'));

  const enabled = Boolean(payload?.enabled);
  const message = payload?.message || '';

  if (enabled) {
    activateMaintenanceMode(message);
  } else {
    deactivateMaintenanceMode();
  }

  return { enabled, message };
};
