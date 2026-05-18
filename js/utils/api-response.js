import { t } from './i18n.js';

export const ensureSuccess = (
  payload,
  fallback = t('errors.requestFailed')
) => {
  if (payload?.status === 'success') {
    return payload.data;
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
