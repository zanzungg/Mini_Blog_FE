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

export const formatRelativeTime = (value) => {
  if (!value) return t('errors.unknownDate');

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return t('errors.unknownDate');
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;

  const localeMap = {
    en: 'en',
    vi: 'vi',
  };

  const locale = localeMap[getLocale()] || 'en';

  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  });

  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  let duration = diffMs / 1000;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }

    duration /= division.amount;
  }
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
