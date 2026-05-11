import { getApiBaseUrl } from './constants.js';

export const buildApiUrl = (path) => new URL(path, getApiBaseUrl()).toString();

export const requestJson = async (path, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
