import { homePage, initHomePage } from '../modules/home/home.page.js';
import { postsPage, initPostsPage } from '../modules/post/post.page.js';
import {
  myPostsPage,
  initMyPostsPage,
  myProfilePage,
  initMyProfilePage,
} from '../modules/user/user.page.js';
import {
  initAuthPage,
  initLogoutPage,
  loginPage,
  logoutPage,
  registerPage,
} from '../modules/auth/auth.page.js';

const HASH_ALIASES = {
  '#': '#home',
};

const normalizeHash = (hash) => HASH_ALIASES[hash] ?? (hash || '#home');

const ROUTES = [
  {
    pattern: '#/login',
    exact: true,
    render: loginPage,
    init: () => initAuthPage('login'),
  },
  {
    pattern: '#/register',
    exact: true,
    render: registerPage,
    init: () => initAuthPage('register'),
  },
  {
    pattern: '#/logout',
    exact: true,
    render: logoutPage,
    init: initLogoutPage,
  },
  {
    pattern: '#/posts',
    exact: false,
    render: postsPage,
    init: initPostsPage,
  },
  {
    pattern: '#/user/profile',
    exact: true,
    render: myProfilePage,
    init: initMyProfilePage,
  },
  {
    pattern: '#/user/posts',
    exact: true,
    render: myPostsPage,
    init: initMyPostsPage,
  },
  {
    pattern: null,
    exact: false,
    render: homePage,
    init: (hash) => {
      initHomePage();
      const baseHash = hash.split('?')[0];
      if (baseHash !== '#home') {
        const section = document.querySelector(baseHash);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }
    },
  },
];

const matchRoute = (hash) => {
  const baseHash = hash.split('?')[0];

  for (const route of ROUTES) {
    if (route.pattern === null) return route;

    if (route.exact) {
      if (hash === route.pattern) return route;
    } else {
      if (baseHash === route.pattern) return route;
    }
  }

  return ROUTES[ROUTES.length - 1];
};

const setActiveLink = (hash) => {
  const baseHash = hash.split('?')[0];
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === baseHash);
  });
};

const renderView = (hash) => {
  const view = document.getElementById('view');
  if (!view) return;

  const route = matchRoute(hash);
  view.innerHTML = route.render();
  route.init(hash);
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
