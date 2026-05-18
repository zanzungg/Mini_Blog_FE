import { t } from '../utils/i18n.js';

export const navbar = () => `
	<nav class="navbar">
		<div class="container nav-inner">
			<div class="nav-links">
				<a href="#home" class="active">${t('nav.home')}</a>
				<a href="#/posts">${t('nav.posts')}</a>
				<a href="#latest">${t('nav.latest')}</a>
				<a href="#categories">${t('nav.categories')}</a>
			</div>
			<button class="nav-toggle" aria-label="${t('nav.toggle')}">${t('nav.menu')}</button>
		</div>
	</nav>
`;
