import { t } from '../utils/i18n.js';

let isModalBound = false;

export const modal = () => `
  <div class="modal" data-modal aria-hidden="true">
    <div class="modal__overlay" data-modal-close></div>
    <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal__close" type="button" data-modal-close aria-label="${t('modal.close')}">×</button>
      <div data-modal-content></div>
    </div>
  </div>
`;

let _lastFocusedElement = null;

export const openModal = (contentHtml = '') => {
  _lastFocusedElement = document.activeElement;
  const modalEl = document.querySelector('[data-modal]');
  const contentEl = document.querySelector('[data-modal-content]');

  if (!modalEl || !contentEl) {
    return;
  }

  contentEl.innerHTML = contentHtml;
  modalEl.classList.add('modal--open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const focusTarget = contentEl.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusTarget) {
    focusTarget.focus();
  }
};

export const closeModal = () => {
  const modalEl = document.querySelector('[data-modal]');
  const contentEl = document.querySelector('[data-modal-content]');

  if (!modalEl || !contentEl) {
    return;
  }

  if (modalEl.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  modalEl.classList.remove('modal--open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  contentEl.innerHTML = '';

  _lastFocusedElement?.focus();
  _lastFocusedElement = null;
};

export const initModal = () => {
  if (isModalBound) {
    return;
  }

  const modalEl = document.querySelector('[data-modal]');
  if (!modalEl) {
    return;
  }

  document.addEventListener('click', (event) => {
    if (event.target.matches('[data-modal-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  isModalBound = true;
};
