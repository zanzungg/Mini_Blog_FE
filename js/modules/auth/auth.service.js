import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
} from './auth.api.js';
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
  const payload = ensureSuccess(data, 'Register failed');

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
    const error = new Error('Missing access token');
    error.details = { message: 'Missing access token' };
    throw error;
  }

  const { data } = await getMeRequest(accessToken);
  const payload = ensureSuccess(data, 'Unable to fetch user profile');
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
      setAuthState({ user: currentUser });
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
