import { toast } from '../../utils/toast.js';
import { login, register, logout } from './auth.service.js';
import { t } from '../../utils/i18n.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLogin = (payload) => {
  if (!payload.email?.trim() || !EMAIL_REGEX.test(payload.email.trim())) {
    return t('auth.validationEmail');
  }
  if (!payload.password) {
    return t('auth.validationPasswordRequired');
  }
  if (payload.password.length < 8) {
    return t('auth.validationPasswordMin');
  }
  if (payload.password.length > 64) {
    return t('auth.validationPasswordMax');
  }
  return null;
};

const validateRegister = (payload) => {
  const name = payload.name?.trim() || '';
  const email = payload.email?.trim() || '';
  const password = payload.password || '';
  const confirmPassword = payload.confirmPassword || '';

  if (!name) {
    return t('auth.validationNameRequired');
  }
  if (name.length < 2) {
    return t('auth.validationNameMin');
  }
  if (name.length > 50) {
    return t('auth.validationNameMax');
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return t('auth.validationEmail');
  }
  if (!password) {
    return t('auth.validationPasswordRequired');
  }
  if (password.length < 8) {
    return t('auth.validationPasswordMin');
  }
  if (password.length > 64) {
    return t('auth.validationPasswordMax');
  }
  if (password !== confirmPassword) {
    return t('auth.validationConfirmMismatch');
  }
  return null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLogin = (payload) => {
  if (!payload.email?.trim() || !EMAIL_REGEX.test(payload.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (!payload.password) {
    return 'Password is required.';
  }
  if (payload.password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (payload.password.length > 64) {
    return 'Password must not exceed 64 characters.';
  }
  return null;
};

const validateRegister = (payload) => {
  const name = payload.name?.trim() || '';
  const email = payload.email?.trim() || '';
  const password = payload.password || '';
  const confirmPassword = payload.confirmPassword || '';

  if (!name) {
    return 'Name is required.';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (name.length > 50) {
    return 'Name must not exceed 50 characters.';
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address.';
  }
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (password.length > 64) {
    return 'Password must not exceed 64 characters.';
  }
  if (password !== confirmPassword) {
    return 'Password confirmation does not match.';
  }
  return null;
};

export const loginPage = () => `
  <section class="auth">
    <div class="auth-card">
      <div>
        <h2 class="auth-title">${t('auth.loginTitle')}</h2>
        <p class="auth-subtitle">${t('auth.loginSubtitle')}</p>
      </div>
      <form class="auth-form" data-auth-form>
        <label class="auth-field">
          <span>${t('auth.email')}</span>
          <input type="email" name="email" autocomplete="email" placeholder="${t('auth.emailPlaceholder')}" required />
        </label>
        <label class="auth-field">
          <span>${t('auth.password')}</span>
          <input type="password" name="password" autocomplete="current-password" placeholder="${t('auth.passwordPlaceholder')}" required />
        </label>
        <button class="btn btn-primary" type="submit">${t('auth.login')}</button>
      </form>
      <p class="auth-footer">
        ${t('auth.newHere')} <a href="#/register">${t('auth.createAccount')}</a>
      </p>
    </div>
  </section>
`;

export const registerPage = () => `
  <section class="auth">
    <div class="auth-card">
      <div>
        <h2 class="auth-title">${t('auth.registerTitle')}</h2>
        <p class="auth-subtitle">${t('auth.registerSubtitle')}</p>
      </div>
      <form class="auth-form" data-auth-form>
        <label class="auth-field">
          <span>${t('auth.name')}</span>
          <input type="text" name="name" autocomplete="name" placeholder="${t('auth.namePlaceholder')}" minlength="2" maxlength="50" required />
        </label>
        <label class="auth-field">
          <span>${t('auth.email')}</span>
          <input type="email" name="email" autocomplete="email" placeholder="${t('auth.emailPlaceholder')}" required />
        </label>
        <label class="auth-field">
          <span>${t('auth.password')}</span>
          <input type="password" name="password" autocomplete="new-password" placeholder="${t('auth.passwordMinPlaceholder')}" minlength="8" maxlength="64" required />
        </label>
        <label class="auth-field">
          <span>${t('auth.confirmPassword')}</span>
          <input type="password" name="confirmPassword" autocomplete="new-password" placeholder="${t('auth.confirmPasswordPlaceholder')}" required />
        </label>
        <button class="btn btn-primary" type="submit">${t('auth.register')}</button>
      </form>
      <p class="auth-footer">
        ${t('auth.alreadyHaveAccount')} <a href="#/login">${t('auth.login')}</a>
      </p>
    </div>
  </section>
`;

export const logoutPage = () => `
  <section class="auth">
    <div class="auth-card">
      <div>
        <h2 class="auth-title">${t('auth.logoutTitle')}</h2>
        <p class="auth-subtitle">${t('auth.logoutSubtitle')}</p>
      </div>
    </div>
  </section>
`;

export const initAuthPage = (mode) => {
  const form = document.querySelector('[data-auth-form]');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  const setLoading = (isLoading) => {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
      ? mode === 'login'
        ? t('auth.loginLoading')
        : t('auth.registerLoading')
      : mode === 'login'
        ? t('auth.login')
        : t('auth.register');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const validationError =
      mode === 'login' ? validateLogin(payload) : validateRegister(payload);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login({
          email: payload.email.trim(),
          password: payload.password,
        });
        toast.success(t('auth.welcomeBackToast'));
        window.location.hash = '#/';
        return;
      }

      await register({
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password,
      });
      toast.success(t('auth.accountCreatedToast'));
      window.location.hash = '#/';
    } catch (error) {
      const message =
        error.details?.message || error.message || t('auth.requestFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });
};

export const initLogoutPage = async () => {
  try {
    await logout();
    toast.success(t('auth.signedOutToast'));
  } catch (error) {
    const message =
      error.details?.message || error.message || t('auth.logoutFailed');
    toast.error(message);
  } finally {
    window.location.hash = '#/login';
  }
};
