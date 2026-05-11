import { mainLayout } from '../layouts/main.layout.js';
import { initRouter } from './router.js';
import { initToast, toast } from '../utils/toast.js';
import { subscribeAuth, getAuthState } from './store.js';
import { updateAuthActions } from '../components/header.js';
import { hydrateAuthUser } from '../modules/auth/auth.service.js';

export const initApp = () => {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = mainLayout();
  initToast();
  initRouter();
  updateAuthActions(getAuthState());
  subscribeAuth((nextState) => updateAuthActions(nextState));

  if (getAuthState().accessToken && !getAuthState().user) {
    hydrateAuthUser().catch((error) => {
      const message =
        error.details?.message || error.message || 'Unable to load profile';
      toast.error(message);
    });
  }

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const closeAuthMenu = () => {
    const menu = document.querySelector('[data-auth-menu]');
    const trigger = document.querySelector('[data-auth-menu-trigger]');
    if (!menu) {
      return;
    }

    menu.classList.remove('open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-auth-menu-trigger]');
    const menu = document.querySelector('[data-auth-menu]');

    if (!menu) {
      return;
    }

    if (trigger) {
      event.preventDefault();
      const isOpen = menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      return;
    }

    if (!event.target.closest('[data-auth-menu]')) {
      closeAuthMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAuthMenu();
    }
  });
};
