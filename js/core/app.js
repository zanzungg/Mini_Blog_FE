import { mainLayout } from '../layouts/main.layout.js';
import { initRouter } from './router.js';

export const initApp = () => {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = mainLayout();
  initRouter();

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
};
