import { getLocale, t } from '../utils/i18n.js';

export const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const formatDate = (value) => {
  if (!value) return t('errors.unknownDate');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('errors.unknownDate');

  const locale = getLocale();
  const localeMap = {
    en: 'en-US',
    vi: 'vi-VN',
  };

  return date.toLocaleDateString(localeMap[locale] || localeMap.en, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const createExcerpt = (content = '', maxLength = 140) => {
  const normalized = String(content).replace(/\s+/g, ' ').trim();
  if (!normalized) return t('errors.noSummary');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
};

export const renderPostContent = (content = '') => {
  const escaped = escapeHtml(content);
  return escaped.replace(/\n/g, '<br />');
};
