import { mainLayout } from '../layouts/main.layout.js';
import { initRouter, renderCurrentRoute } from './router.js';
import { initToast, toast } from '../utils/toast.js';
import { subscribeAuth, getAuthState } from './store.js';
import { updateAuthActions } from '../components/header.js';
import { hydrateAuthUser } from '../modules/auth/auth.service.js';
import {
  initI18n,
  getLocale,
  setLocale,
  subscribeLocale,
  t,
} from '../utils/i18n.js';

let isAppBound = false;

const bindNavToggle = () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
};

const bindLanguageSwitcher = () => {
  const select = document.querySelector('[data-language-select]');
  if (!select) return;
  select.value = getLocale();
  select.addEventListener('change', (event) => {
    setLocale(event.target.value);
  });
};

const bindGlobalInteractions = () => {
  if (isAppBound) return;

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

  isAppBound = true;
};

const renderShell = (app) => {
  app.innerHTML = mainLayout();
  initToast();
  updateAuthActions(getAuthState());
  bindNavToggle();
  bindLanguageSwitcher();
};

export const initApp = () => {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  initI18n();
  renderShell(app);
  initRouter();
  subscribeAuth((nextState) => updateAuthActions(nextState));
  bindGlobalInteractions();

  subscribeLocale(() => {
    renderShell(app);
    renderCurrentRoute();
  });

  if (getAuthState().accessToken && !getAuthState().user) {
    hydrateAuthUser().catch((error) => {
      const message =
        error.details?.message ||
        error.message ||
        t('errors.unableLoadProfile');
      toast.error(message);
    });
  }
};
