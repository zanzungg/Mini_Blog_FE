import { getApiBaseUrl } from './constants.js';
import { getAuthState } from '../core/store.js';

export const buildApiUrl = (path) => new URL(path, getApiBaseUrl()).toString();

let _isRefreshing = false;
let _refreshPromise = null;

const doFetch = async (path, options = {}) => {
  const { accessToken } = getAuthState();

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',

      // Auto attach access token nếu có
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),

      // Cho phép override
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const error = new Error('Unexpected response format');
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  return { data, status: response.status };
};

export const requestJson = async (path, options = {}) => {
  const result = await doFetch(path, options);

  if (result.status !== 401) {
    return result;
  }

  if (path.includes('/auth/refresh') || path.includes('/auth/login')) {
    return result;
  }

  if (!_isRefreshing) {
    _isRefreshing = true;
    _refreshPromise = import('../modules/auth/auth.service.js')
      .then(({ refreshAccessToken }) => refreshAccessToken())
      .finally(() => {
        _isRefreshing = false;
        _refreshPromise = null;
      });
  }

  try {
    const newAccessToken = await _refreshPromise;

    const retryOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      },
    };

    return doFetch(path, retryOptions);
  } catch {
    const { clearAuthState } = await import('../core/store.js');
    clearAuthState();
    window.location.hash = '#/login';

    const error = new Error('Session expired. Please login again.');
    error.statusCode = 401;
    throw error;
  }
};
