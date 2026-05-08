let isModalBound = false;

export const modal = () => `
  <div class="modal" data-modal aria-hidden="true">
    <div class="modal__overlay" data-modal-close></div>
    <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal__close" type="button" data-modal-close aria-label="Close">×</button>
      <div data-modal-content></div>
    </div>
  </div>
`;

export const openModal = (contentHtml = '') => {
  const modalEl = document.querySelector('[data-modal]');
  const contentEl = document.querySelector('[data-modal-content]');

  if (!modalEl || !contentEl) {
    return;
  }

  contentEl.innerHTML = contentHtml;
  modalEl.classList.add('modal--open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
};

export const closeModal = () => {
  const modalEl = document.querySelector('[data-modal]');
  const contentEl = document.querySelector('[data-modal-content]');

  if (!modalEl || !contentEl) {
    return;
  }

  modalEl.classList.remove('modal--open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  contentEl.innerHTML = '';
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
    const closeTrigger = event.target.closest('[data-modal-close]');
    if (closeTrigger) {
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
