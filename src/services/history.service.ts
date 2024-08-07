import httpStatus from 'http-status';

import { DEFAULT_LIMIT } from '../config/constants';
import logger from '../config/logger';
import { recentAlertsQuery, recentEventsQuery, recentTxQuery } from '../queries';
import { savedContractService } from '../services';
import { RecentAlert, RecentEvent, RecentTransaction } from '../types/history';
import ApiError from '../utils/ApiError';
import { validateAndSanitizeContractId } from '../utils/contractValidation';

type HistoryFunction<T> = (contractIds: string[], limit?: number, userId?: string) => Promise<T>;

interface HistoryService {
  getRecentTx: HistoryFunction<RecentTransaction[]>;
  getRecentEvents: HistoryFunction<RecentEvent[]>;
  getRecentAlerts: HistoryFunction<RecentAlert[]>;
}

/**
 * Logs a message, executes a query function, and handles errors.
 * @param {Function} queryFunc - The query function to execute.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {number} limit - The maximum number of items to fetch.
 * @param {string} logMessage - The message to log.
 * @returns {Promise<any>} - The result of the query function.
 */
const logAndFetch = async (
  queryFunc: (contractIds: string[], limit: number) => Promise<any>,
  contractIds: string[],
  limit: number,
  logMessage: string
): Promise<any> => {
  try {
    logger.info(`${logMessage} with limit ${limit}`);
    return await queryFunc(contractIds, limit);
  } catch (error) {
    logger.error(`${logMessage} :`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch data`);
  }
};

/**
 * Fetch recent Soroban contract transactions
 * @param {string[]} contractIds - The IDs of the Soroban contracts
 * @param {number} limit - The maximum number of transactions to fetch (default: 10)
 * @param {string} userId - The user ID to fetch contract nickname for.
 * @returns {Promise<RecentTransaction[]>} Array of recent transactions
 */
const getRecentTx: HistoryFunction<RecentTransaction[]> = async (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT,
  userId?: string
): Promise<RecentTransaction[]> => {
  contractIds = contractIds.map(validateAndSanitizeContractId);
  const data = await logAndFetch(
    recentTxQuery.getRecentContractTx,
    contractIds,
    limit,
    `Fetching recent transactions for contracts ${contractIds.join(',')}`
  );

  return Promise.all(
    data.map(async (tx: any) => {
      const contractNickname = userId
        ? await savedContractService.getContractNickname(tx.contract_id, userId)
        : undefined;
      return {
        contractId: tx.contract_id,
        contractNickname,
        sourceAccount: tx.op_source_account,
        transactionHash: tx.transaction_hash,
        ledgerSequence: tx.ledger_sequence,
        createdAt: tx.txn_created_at.value,
        functionName: tx.function_name,
        parameters: tx.parameters,
        successful: tx.successful,
        feeCharged: tx.fee_charged
      };
    })
  );
};

/**
 * Fetch recent Soroban contract events
 * @param {string[]} contractIds - The IDs of the Soroban contracts
 * @param {number} limit - The maximum number of events to fetch (default: 10)
 * @param {string} userId - The user ID to fetch contract nickname for.
 * @returns {Promise<RecentEvent[]>} Array of recent events
 */
const getRecentEvents: HistoryFunction<RecentEvent[]> = async (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT,
  userId?: string
): Promise<RecentEvent[]> => {
  contractIds = contractIds.map(validateAndSanitizeContractId);
  const data = await logAndFetch(
    recentEventsQuery.getRecentContractEvents,
    contractIds,
    limit,
    `Fetching recent events for contracts ${contractIds.join(',')}`
  );

  return Promise.all(
    data.map(async (event: any) => {
      const contractNickname = userId
        ? await savedContractService.getContractNickname(event.contract_id, userId)
        : undefined;

      let parsedTopics = [];
      let parsedData = null;

      try {
        const topicsObj = JSON.parse(event.topics_decoded);
        parsedTopics = topicsObj.topics_decoded || [];
      } catch (e) {
        logger.warn(`Failed to parse topics for event: ${event.transaction_hash}`, e);
      }

      try {
        const dataObj = JSON.parse(event.data_decoded);
        parsedData = dataObj.value || null;
      } catch (e) {
        logger.warn(`Failed to parse data for event: ${event.transaction_hash}`, e);
      }

      return {
        contractId: event.contract_id,
        contractNickname,
        transactionHash: event.transaction_hash,
        ledgerSequence: event.ledger_sequence,
        createdAt: event.closed_at.value,
        eventType: event.type_string,
        topics: parsedTopics,
        data: parsedData,
        successful: event.successful,
        inSuccessfulContractCall: event.in_successful_contract_call
      };
    })
  );
};

/**
 * Fetch recent Soroban contract alerts
 * @param {string[]} contractIds - The IDs of the Soroban contracts
 * @param {number} limit - The maximum number of alerts to fetch (default: 10)
 * @param {string} userId - The user ID to fetch contract nickname for.
 * @returns {Promise<RecentAlert[]>} Array of recent alerts
 */
const getRecentAlerts: HistoryFunction<RecentAlert[]> = async (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT,
  userId?: string
): Promise<RecentAlert[]> => {
  contractIds = contractIds.map(validateAndSanitizeContractId);
  const data = await logAndFetch(
    recentAlertsQuery.getRecentAlerts,
    contractIds,
    limit,
    `Fetching recent alerts for contracts ${contractIds.join(',')}`
  );

  return Promise.all(
    data.map(async (alert: any) => {
      const contractNickname = userId
        ? await savedContractService.getContractNickname(alert.contract_id, userId)
        : undefined;
      return {
        contractId: alert.contract_id,
        contractNickname,
        alertTime: alert.alert_time.value,
        totalTransactions: alert.total_transactions,
        failedTransactions: alert.failed_transactions,
        errorRate: parseFloat((alert.error_rate * 100).toFixed(2))
      };
    })
  );
};

const historyService: HistoryService = {
  getRecentTx,
  getRecentEvents,
  getRecentAlerts
};

export default historyService;
