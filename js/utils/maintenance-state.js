import { MAINTENANCE_MESSAGE_KEY } from './constants.js';

let maintenanceActive = false;

export const isMaintenanceActive = () => maintenanceActive;

export const activateMaintenanceMode = (message) => {
  maintenanceActive = true;

  if (message) {
    sessionStorage.setItem(MAINTENANCE_MESSAGE_KEY, message);
  }
};

export const deactivateMaintenanceMode = () => {
  maintenanceActive = false;

  sessionStorage.removeItem(MAINTENANCE_MESSAGE_KEY);
};
