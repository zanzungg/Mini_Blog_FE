import { t } from '../../utils/i18n.js';
import { MAINTENANCE_MESSAGE_KEY } from '../../utils/constants.js';
import { escapeHtml } from '../../components/utils.js';
import { checkMaintenanceStatus } from './maintenance.service.js';
import { toast } from '../../utils/toast.js';

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
  const messageEl = document.querySelector('[data-maintenance-message]');

  if (!retryButton) {
    return;
  }

  const setLoading = (isLoading) => {
    retryButton.disabled = isLoading;
    retryButton.textContent = isLoading
      ? t('maintenance.retrying')
      : t('maintenance.retry');
  };

  const updateMessage = (message) => {
    if (!messageEl) return;
    messageEl.textContent = message;
  };

  retryButton.addEventListener('click', async () => {
    setLoading(true);

    try {
      const result = await checkMaintenanceStatus();
      if (!result.enabled) {
        window.location.hash = '#home';
        return;
      }

      const nextMessage = result.message || t('maintenance.message');
      updateMessage(nextMessage);
      toast.error(t('maintenance.stillActive'));
    } catch (error) {
      const message =
        error.details?.message || error.message || t('maintenance.checkFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });
};
