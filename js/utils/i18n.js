import { LOCALE_STORAGE_KEY } from './constants.js';
import { en } from '../i18n/en.js';
import { vi } from '../i18n/vi.js';

const MESSAGES = { en, vi };
const DEFAULT_LOCALE = 'en';

let currentLocale = DEFAULT_LOCALE;
const listeners = new Set();

const resolveLocale = (value) => (value in MESSAGES ? value : DEFAULT_LOCALE);

const getValue = (source, path) =>
  path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), source);

const formatMessage = (message, vars = {}) =>
  String(message).replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{${key}}`
  );

const applyLocale = () => {
  document.documentElement.lang = currentLocale;
  document.title = t('app.title');
};

export const getLocale = () => currentLocale;

export const initI18n = () => {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  const preferVi =
    !stored && typeof navigator !== 'undefined'
      ? navigator.language?.toLowerCase().startsWith('vi')
      : false;

  currentLocale = resolveLocale(stored || (preferVi ? 'vi' : DEFAULT_LOCALE));
  applyLocale();
};

export const setLocale = (nextLocale) => {
  const resolved = resolveLocale(nextLocale);
  if (resolved === currentLocale) {
    return false;
  }

  currentLocale = resolved;
  localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
  applyLocale();
  listeners.forEach((listener) => listener(currentLocale));
  return true;
};

export const subscribeLocale = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const t = (key, vars = {}) => {
  const message =
    getValue(MESSAGES[currentLocale], key) ??
    getValue(MESSAGES[DEFAULT_LOCALE], key) ??
    key;

  return typeof message === 'string' ? formatMessage(message, vars) : key;
};
