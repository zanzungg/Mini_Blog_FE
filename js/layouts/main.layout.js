import { header } from '../components/header.js';
import { navbar } from '../components/navbar.js';
import { footer } from '../components/footer.js';

export const mainLayout = () => `
	${header()}
	${navbar()}
	<main id="view" class="container"></main>
	${footer()}
`;
