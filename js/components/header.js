import { getAuthState } from '../core/store.js';
import { t } from '../utils/i18n.js';

const renderAuthActions = (state) => {
  if (state?.isAuthenticated && state?.user) {
    const name = state.user.name || state.user.email || '';
    return `
		<div class="auth-menu" data-auth-menu>
			<button class="auth-trigger" type="button" data-auth-menu-trigger aria-haspopup="true" aria-expanded="false">
				<span class="auth-user">${t('header.hello', { name })}</span>
				<span class="auth-caret" aria-hidden="true">v</span>
			</button>
			<div class="auth-dropdown" data-auth-dropdown>
				<a href="#/user/profile">${t('header.myProfile')}</a>
				<a href="#/user/posts">${t('header.myPosts')}</a>
				<a href="#/logout">${t('header.logout')}</a>
			</div>
		</div>
	`;
  }

  return `
		<a class="auth-link" href="#/login">${t('header.login')}</a>
		<a class="auth-link auth-link--primary" href="#/register">${t('header.register')}</a>
	`;
};

const renderLanguageSwitcher = () => `
	<div class="lang-switch">
		<label class="lang-switch__label" for="language-select">${t('header.language')}</label>
		<select id="language-select" class="lang-switch__select" data-language-select>
			<option value="en">${t('languages.en')}</option>
			<option value="vi">${t('languages.vi')}</option>
		</select>
	</div>
`;

export const updateAuthActions = (state = getAuthState()) => {
  const container = document.querySelector('[data-auth-actions]');
  if (!container) {
    return;
  }

  container.innerHTML = renderAuthActions(state);
};

export const header = () => {
  const state = getAuthState();

  return `
	<header class="header">
		<div class="container brand">
			<div>
				<div class="brand__logo">${t('app.brand')}</div>
			</div>
			${renderLanguageSwitcher()}
			<div class="auth-actions" data-auth-actions>
				${renderAuthActions(state)}
			</div>
		</div>
	</header>
`;
};
