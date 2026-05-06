export const initRouter = () => {
  const updateActive = () => {
    const hash = window.location.hash || '#home';
    const links = document.querySelectorAll('.nav-links a');

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === hash;
      link.classList.toggle('active', isActive);
    });
  };

  updateActive();
  window.addEventListener('hashchange', updateActive);
};
