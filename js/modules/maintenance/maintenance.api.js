import { requestJson } from '../../utils/helpers.js';

export const getMaintenanceStatusRequest = () =>
  requestJson('/maintenance/status');
