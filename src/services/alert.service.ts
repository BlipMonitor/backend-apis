import { AlertType } from '@prisma/client';
import httpStatus from 'http-status';

import logger from '../config/logger';
import { hourlyAlertsQuery } from '../queries';
import { savedContractService } from '../services';
import { Alert, AlertParams } from '../types/alert';
import ApiError from '../utils/ApiError';
import { validateAndSanitizeContractId } from '../utils/contractValidation';

/**
 * Fetch alerts for the given contract IDs and time range
 * @param {AlertParams} params - The parameters for fetching alerts
 * @param {string} userId - The user ID to fetch contract nickname for
 * @returns {Promise<Alert[]>} Array of alerts
 */
const getHourlylerts = async (params: AlertParams, userId?: string): Promise<Alert[]> => {
  const { contractIds, startTime, endTime } = params;
  const sanitizedContractIds = contractIds.map(validateAndSanitizeContractId);

  try {
    logger.info(
      `Fetching alerts for contracts ${sanitizedContractIds.join(',')} from ${startTime} to ${endTime}`
    );
    const alerts = await hourlyAlertsQuery.getHourlyAlerts(
      sanitizedContractIds,
      startTime,
      endTime
    );

    return Promise.all(
      alerts.map(async (alert: any) => {
        const contractNickname = userId
          ? await savedContractService.getContractNickname(alert.contract_id, userId)
          : null; // Change this to null instead of undefined

        return {
          id: `${alert.contract_id}-${alert.alert_time.value}`,
          contractId: alert.contract_id,
          contractNickname, // This will now be either a string or null
          alertTime: new Date(alert.alert_time.value),
          alertType: AlertType.ERROR_RATE_HIGH,
          totalTransactions: alert.total_transactions,
          failedTransactions: alert.failed_transactions,
          errorRate: parseFloat((alert.error_rate * 100).toFixed(2)),
          message: `Error rate of ${(alert.error_rate * 100).toFixed(2)}% detected for contract ${alert.contract_id}`
        };
      })
    );
  } catch (error) {
    logger.error('Error fetching Soroban contract alerts:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch Soroban contract alerts');
  }
};

const alertService = {
  getHourlylerts
};

export default alertService;
