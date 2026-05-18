import { t } from '../utils/i18n.js';

export const footer = () => `
	<footer class="footer">
		<div class="container footer-grid">
			<div>
				<h4>${t('app.brand')}</h4>
				<p>${t('footer.description')}</p>
			</div>
			<div>
				<h4>${t('footer.explore')}</h4>
				<p>${t('footer.about')}</p>
				<p>${t('footer.contact')}</p>
			</div>
			<div>
				<h4>${t('footer.follow')}</h4>
				<p>${t('footer.instagram')}</p>
				<p>${t('footer.twitter')}</p>
			</div>
		</div>
	</footer>
`;
