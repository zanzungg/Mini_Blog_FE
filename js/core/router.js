import { homePage } from '../modules/home/home.page.js';
import { loginPage, registerPage } from '../modules/auth/auth.page.js';

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

  if (hash === '#login') {
    view.innerHTML = loginPage();
    return;
  }

  if (hash === '#register') {
    view.innerHTML = registerPage();
    return;
  }

  view.innerHTML = homePage();

  if (hash !== '#home') {
    const section = document.querySelector(hash);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

export const initRouter = () => {
  const updateRoute = () => {
    const hash = window.location.hash || '#home';
    renderView(hash);
    setActiveLink(hash);
  };

  updateRoute();
  window.addEventListener('hashchange', updateRoute);
};
