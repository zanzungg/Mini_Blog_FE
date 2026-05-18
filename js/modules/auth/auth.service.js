import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
  refreshTokenRequest,
} from './auth.api.js';

import {
  clearAuthState,
  getAuthState,
  setAuthState,
} from '../../core/store.js';

import { ensureSuccess, normalizeError } from '../../utils/api-response.js';
import { t } from '../../utils/i18n.js';

export const login = async (credentials) => {
  const { data } = await loginRequest(credentials);

  const payload = ensureSuccess(data, t('auth.loginFailed'));

  setAuthState({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  const user = payload.user || (await fetchCurrentUser());

  setAuthState({
    user,
  });

  return user;
};

export const register = async (formData) => {
  const { data } = await registerRequest(formData);

  const payload = ensureSuccess(data, t('auth.registerFailed'));

  setAuthState({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  const user = payload.user || (await fetchCurrentUser());

  setAuthState({
    user,
  });

  return user;
};

export const fetchCurrentUser = async () => {
  const { accessToken } = getAuthState();

  if (!accessToken) {
    const error = new Error(t('auth.missingAccessToken'));

    error.details = {
      message: t('auth.missingAccessToken'),
    };

    throw error;
  }

  const { data } = await getMeRequest();

  const payload = ensureSuccess(data, t('auth.profileFetchFailed'));

  return payload.user || null;
};

export const hydrateAuthUser = async () => {
  const { accessToken, user } = getAuthState();

  if (!accessToken || user) {
    return user || null;
  }

  try {
    const currentUser = await fetchCurrentUser();

    if (currentUser) {
      setAuthState({
        user: currentUser,
      });
    }

    return currentUser;
  } catch (error) {
    clearAuthState();
    throw error;
  }
};

export const logout = async () => {
  const { refreshToken } = getAuthState();

  if (!refreshToken) {
    clearAuthState();

    return {
      success: true,
    };
  }

  try {
    const { data } = await logoutRequest({
      refreshToken,
    });

    const payload = ensureSuccess(data, t('auth.logoutFailed'));

    return payload;
  } catch (error) {
    const normalized = normalizeError(error.details, t('auth.logoutFailed'));

    throw Object.assign(error, {
      details: normalized,
    });
  } finally {
    clearAuthState();
  }
};

export const refreshAccessToken = async () => {
  const { refreshToken } = getAuthState();

  if (!refreshToken) {
    clearAuthState();

    const error = new Error(t('auth.noRefreshToken'));

    error.details = {
      message: t('auth.noRefreshToken'),
    };

    throw error;
  }

  const { data } = await refreshTokenRequest({
    refreshToken,
  });

  const payload = ensureSuccess(data, t('auth.refreshFailed'));

  setAuthState({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    ...(payload.user
      ? {
          user: payload.user,
        }
      : {}),
  });

  return payload.accessToken;
};
