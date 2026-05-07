const DEFAULT_DURATION = 3500;
const TOAST_LIMIT = 5;

let toastRoot = null;
let toastCounter = 0;

const ensureRoot = () => {
  if (!toastRoot) {
    toastRoot = document.getElementById('toast-root');
  }

  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'toast-root';
    toastRoot.className = 'toast-root';
    toastRoot.setAttribute('aria-live', 'polite');
    toastRoot.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastRoot);
  }

  return toastRoot;
};

const createToastElement = ({ id, message, type }) => {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('data-toast-id', id);
  toast.setAttribute('role', 'status');

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '!' : '…';

  const text = document.createElement('div');
  text.className = 'toast__message';
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);

  return toast;
};

const removeToastElement = (toast) => {
  if (!toast) {
    return;
  }

  toast.classList.add('toast--leave');
  toast.addEventListener(
    'transitionend',
    () => {
      toast.remove();
    },
    { once: true }
  );
};

const pruneToasts = () => {
  if (!toastRoot) {
    return;
  }

  const toasts = Array.from(toastRoot.querySelectorAll('.toast'));
  if (toasts.length <= TOAST_LIMIT) {
    return;
  }

  toasts.slice(0, toasts.length - TOAST_LIMIT).forEach(removeToastElement);
};

const showToast = (
  message,
  { type = 'default', duration = DEFAULT_DURATION } = {}
) => {
  const root = ensureRoot();
  const id = `toast-${Date.now()}-${toastCounter++}`;
  const toast = createToastElement({ id, message, type });

  root.appendChild(toast);
  pruneToasts();

  if (duration !== Infinity) {
    window.setTimeout(() => dismiss(id), duration);
  }

  return id;
};

const dismiss = (id) => {
  if (!toastRoot) {
    return;
  }

  const toast = toastRoot.querySelector(`[data-toast-id="${id}"]`);
  removeToastElement(toast);
};

const dismissAll = () => {
  if (!toastRoot) {
    return;
  }

  const toasts = toastRoot.querySelectorAll('.toast');
  toasts.forEach(removeToastElement);
};

export const initToast = () => {
  ensureRoot();
};

export const toast = (message, options = {}) => showToast(message, options);

toast.success = (message, options = {}) =>
  showToast(message, { ...options, type: 'success' });
toast.error = (message, options = {}) =>
  showToast(message, { ...options, type: 'error' });
toast.loading = (message, options = {}) =>
  showToast(message, { ...options, type: 'loading', duration: Infinity });

toast.dismiss = (id) => {
  if (id) {
    dismiss(id);
    return;
  }

  dismissAll();
};

toast.remove = (id) => toast.dismiss(id);
