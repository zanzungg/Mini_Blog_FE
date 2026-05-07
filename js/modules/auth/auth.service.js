import { loginRequest, registerRequest, logoutRequest } from './auth.api.js';
import {
  clearAuthState,
  getAuthState,
  setAuthState,
} from '../../core/store.js';

const normalizeError = (payload, fallback) => {
  if (!payload) {
    return { message: fallback };
  }

  if (payload.status === 'error') {
    return payload;
  }

  return { message: fallback };
};

const ensureSuccess = (payload, fallback) => {
  if (payload?.status === 'success') {
    return payload.data;
  }

  const error = new Error(payload?.message || fallback);
  error.details = payload;
  throw error;
};

export const login = async (credentials) => {
  const { data } = await loginRequest(credentials);
  const payload = ensureSuccess(data, 'Login failed');

  setAuthState({
    user: payload.user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  return payload.user;
};

export const register = async (formData) => {
  const { data } = await registerRequest(formData);
  const payload = ensureSuccess(data, 'Register failed');

  setAuthState({
    user: payload.user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  return payload.user;
};

export const logout = async () => {
  const { refreshToken } = getAuthState();

  if (!refreshToken) {
    clearAuthState();
    return { success: true };
  }

  try {
    const { data } = await logoutRequest({ refreshToken });
    const payload = ensureSuccess(data, 'Logout failed');
    return payload;
  } catch (error) {
    const normalized = normalizeError(error.details, 'Logout failed');
    throw Object.assign(error, { details: normalized });
  } finally {
    clearAuthState();
  }
};
