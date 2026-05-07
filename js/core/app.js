import { mainLayout } from '../layouts/main.layout.js';
import { initRouter } from './router.js';
import { initToast } from '../utils/toast.js';
import { subscribeAuth, getAuthState } from './store.js';
import { updateAuthActions } from '../components/header.js';

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

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
};