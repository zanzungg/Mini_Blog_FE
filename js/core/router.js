import { homePage, initHomePage } from '../modules/home/home.page.js';
import { postsPage, initPostsPage } from '../modules/post/post.page.js';
import {
  initAuthPage,
  initLogoutPage,
  loginPage,
  logoutPage,
  registerPage,
} from '../modules/auth/auth.page.js';

const normalizeHash = (hash) => {
  if (!hash || hash === '#') {
    return '#home';
  }

  if (hash === '#login') {
    return '#/auth/login';
  }

  if (hash === '#register') {
    return '#/auth/register';
  }

  if (hash === '#auth/login') {
    return '#/auth/login';
  }

  if (hash === '#auth/register') {
    return '#/auth/register';
  }

  if (hash === '#auth/logout') {
    return '#/auth/logout';
  }

  return hash;
};

const setActiveLink = (hash) => {
  const links = document.querySelectorAll('.nav-links a');

  links.forEach((link) => {
    const isActive = link.getAttribute('href') === hash;
    link.classList.toggle('active', isActive);
  });
};

const renderView = (hash) => {
  const view = document.getElementById('view');
  if (!view) {
    return;
  }

  if (hash === '#/auth/login') {
    view.innerHTML = loginPage();
    initAuthPage('login');
    return;
  }

  if (hash === '#/auth/register') {
    view.innerHTML = registerPage();
    initAuthPage('register');
    return;
  }

  if (hash === '#/auth/logout') {
    view.innerHTML = logoutPage();
    initLogoutPage();
    return;
  }

  if (hash === '#/posts') {
    view.innerHTML = postsPage();
    initPostsPage();
    return;
  }

  view.innerHTML = homePage();
  initHomePage();

  if (hash !== '#home') {
    const section = document.querySelector(hash);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

export const initRouter = () => {
  const updateRoute = () => {
    const hash = normalizeHash(window.location.hash || '#home');
    renderView(hash);
    setActiveLink(hash);
  };

  updateRoute();
  window.addEventListener('hashchange', updateRoute);
};
