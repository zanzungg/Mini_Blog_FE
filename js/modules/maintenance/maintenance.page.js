import { t } from '../../utils/i18n.js';
import { MAINTENANCE_MESSAGE_KEY } from '../../utils/constants.js';
import { escapeHtml } from '../../components/utils.js';

export const maintenancePage = () => {
  const rawMessage = sessionStorage.getItem(MAINTENANCE_MESSAGE_KEY);

  const message = rawMessage || t('maintenance.message');

  return `
    <section class="auth">
      <div class="auth-card">
        <div>
          <h2 class="auth-title">
            ${t('maintenance.title')}
          </h2>

          <p class="auth-subtitle">
            ${t('maintenance.subtitle')}
          </p>
        </div>

        <p
          class="auth-subtitle"
          data-maintenance-message
        >
          ${escapeHtml(message)}
        </p>

        <div class="maintenance-actions">
          <button
            class="btn btn-primary"
            data-maintenance-retry
          >
            ${t('maintenance.retry')}
          </button>
        </div>
      </div>
    </section>
  `;
};

export const initMaintenancePage = () => {
  const retryButton = document.querySelector('[data-maintenance-retry]');

  if (!retryButton) {
    return;
  }

  retryButton.addEventListener('click', () => {
    window.location.reload();
  });
};
