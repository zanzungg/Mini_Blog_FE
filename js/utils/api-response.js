import { t } from './i18n.js';
import { MAINTENANCE_HASH } from './constants.js';
import {
  activateMaintenanceMode,
  deactivateMaintenanceMode,
} from './maintenance-state.js';

const isMaintenanceError = (payload) =>
  payload?.status === 'error' && Number(payload?.statusCode) === 503;

const redirectToMaintenance = (payload) => {
  if (typeof window === 'undefined') return;

  activateMaintenanceMode(payload?.message);

  if (window.location.hash !== MAINTENANCE_HASH) {
    window.location.hash = MAINTENANCE_HASH;
  }
};

export const ensureSuccess = (
  payload,
  fallback = t('errors.requestFailed')
) => {
  if (payload?.status === 'success') {
    deactivateMaintenanceMode();

    return payload.data;
  }

  if (isMaintenanceError(payload)) {
    redirectToMaintenance(payload);
  }

  const error = new Error(payload?.message || fallback);

  error.details = payload;

  throw error;
};

export const normalizeError = (payload, fallback = t('errors.generic')) => {
  if (!payload) {
    return {
      message: fallback,
    };
  }

  if (payload.status === 'error') {
    return payload;
  }

  return {
    message: fallback,
  };
};
