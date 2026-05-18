import { t } from '../utils/i18n.js';

let isConfirmBound = false;

export const modalConfirm = () => `
  <div class="modal modal--confirm" data-confirm-modal aria-hidden="true">
    <div class="modal__overlay" data-confirm-cancel></div>
    <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div data-confirm-content>
        <p class="modal__title" id="confirm-title"></p>
        <p class="modal__body" id="confirm-message"></p>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" data-confirm-cancel>${t('modal.cancel')}</button>
          <button class="btn btn-primary" type="button" data-confirm-ok>${t('modal.confirm')}</button>
        </div>
      </div>
    </div>
  </div>
`;

let _resolveFn = null;

export const openConfirm = ({
  title = t('modal.confirmTitle'),
  message = '',
} = {}) => {
  const modalEl = document.querySelector('[data-confirm-modal]');
  if (!modalEl) return Promise.resolve(false);

  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;

  modalEl.classList.add('modal--open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  return new Promise((resolve) => {
    _resolveFn = resolve;
  });
};

const closeConfirm = (result) => {
  const modalEl = document.querySelector('[data-confirm-modal]');
  if (!modalEl) return;

  modalEl.classList.remove('modal--open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (_resolveFn) {
    _resolveFn(result);
    _resolveFn = null;
  }
};

export const initConfirmModal = () => {
  if (isConfirmBound) return;

  const modalEl = document.querySelector('[data-confirm-modal]');
  if (!modalEl) return;

  document.addEventListener('click', (event) => {
    if (!document.querySelector('[data-confirm-modal].modal--open')) return;

    if (event.target.matches('[data-confirm-ok]')) {
      closeConfirm(true);
      return;
    }

    if (event.target.matches('[data-confirm-cancel]')) {
      closeConfirm(false);
      return;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeConfirm(false);
    }
  });

  isConfirmBound = true;
};
