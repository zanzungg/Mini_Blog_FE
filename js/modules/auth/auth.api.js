import { requestJson } from '../../utils/helpers.js';

export const loginRequest = (payload) =>
  requestJson('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const registerRequest = (payload) =>
  requestJson('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const logoutRequest = (payload) =>
  requestJson('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getMeRequest = (accessToken) =>
  requestJson('/auth/me', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
