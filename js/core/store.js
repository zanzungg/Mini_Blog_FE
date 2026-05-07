import { AUTH_STORAGE_KEY } from '../utils/constants.js';

const listeners = new Set();

const getInitialState = () => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
});

const loadState = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }
    const parsed = JSON.parse(raw);
    return {
      ...getInitialState(),
      ...parsed,
      isAuthenticated: Boolean(parsed?.accessToken),
    };
  } catch (error) {
    return getInitialState();
  }
};

let state = loadState();

const persistState = () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

const notify = () => {
  listeners.forEach((listener) => listener({ ...state }));
};

export const getAuthState = () => ({ ...state });

export const setAuthState = (nextState) => {
  state = {
    ...state,
    ...nextState,
    isAuthenticated: Boolean(nextState?.accessToken || state.accessToken),
  };
  persistState();
  notify();
};

export const clearAuthState = () => {
  state = getInitialState();
  localStorage.removeItem(AUTH_STORAGE_KEY);
  notify();
};

export const subscribeAuth = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
