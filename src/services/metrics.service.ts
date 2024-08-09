import httpStatus from 'http-status';

import { DEFAULT_LIMIT } from '../config/constants';
import logger from '../config/logger';
import {
  topEventsQuery,
  topUsersQuery,
  txFeesQuery,
  txSuccessRateQuery,
  txVolumeQuery,
  uniqueUsersQuery
} from '../queries';
import { savedContractService } from '../services';
import {
  TopEvent,
  TopUser,
  TransactionFeesWithComparison,
  TransactionSuccessRateWithComparison,
  TransactionVolumeWithComparison,
  UniqueUsersWithComparison
} from '../types/metrics';
import { TimeRange } from '../types/timeRange';
import ApiError from '../utils/ApiError';

type MetricFunction<T> = (
  contractIds: string[],
  timeRange: TimeRange,
  userId: string,
  limit?: number
) => Promise<T>;

interface MetricsService {
  getTxVolume: MetricFunction<TransactionVolumeWithComparison>;
  getTxSuccessRate: MetricFunction<TransactionSuccessRateWithComparison>;
  getUniqueUsers: MetricFunction<UniqueUsersWithComparison>;
  getTxFees: MetricFunction<TransactionFeesWithComparison>;
  getTopEvents: MetricFunction<TopEvent[]>;
  getTopUsers: MetricFunction<TopUser[]>;
}

/**
 * Logs a message, executes a query function, and handles errors.
 * @param {Function} queryFunc - The query function to execute.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} timeRange - The time range for the query.
 * @param {string} logMessage - The message to log.
 * @returns {Promise<any>} - The result of the query function.
 */
const logAndFetch = async (
  queryFunc: (contractIds: string[], timeRange: TimeRange) => Promise<any>,
  contractIds: string[],
  timeRange: TimeRange,
  logMessage: string
): Promise<any> => {
  try {
    logger.info(logMessage);
    return await queryFunc(contractIds, timeRange);
  } catch (error) {
    logger.error(`${logMessage} :`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch data`);
  }
};

/**
 * Logs a message, executes a query function, and handles errors.
 * @param {Function} queryFunc - The query function to execute.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} timeRange - The time range for the query.
 * @param {number} limit - The maximum number of results to return.
 * @param {string} logMessage - The message to log.
 * @returns {Promise<any>} - The result of the query function.
 */
const logAndFetchWithLimit = async (
  queryFunc: (contractIds: string[], timeRange: TimeRange, limit: number) => Promise<any>,
  contractIds: string[],
  timeRange: TimeRange,
  limit: number,
  logMessage: string
): Promise<any> => {
  try {
    logger.info(`${logMessage} with limit ${limit}`);
    return await queryFunc(contractIds, timeRange, limit);
  } catch (error) {
    logger.error(`${logMessage} :`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch data`);
  }
};

/**
 * Calculates the absolute and percentage changes between two values.
 * @param {number} current - The current value.
 * @param {number} previous - The previous value.
 * @param {number} decimals - The number of decimal places to round to.
 * @returns {Object} - The absolute and percentage changes.
 */
const calculateChanges = (current: number, previous: number, decimals: number = 2) => {
  const absoluteChange = current - previous;
  const percentageChange =
    previous !== 0 ? roundTo((absoluteChange / previous) * 100, decimals) : null;
  return { previousCount: previous, absoluteChange, percentageChange };
};

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} value - The number to round.
 * @param {number} decimals - The number of decimal places.
 * @returns {number} - The rounded number.
 */
const roundTo = (value: number, decimals: number): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * Fetches transaction volume data for the given contracts and time range.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} [timeRange=TimeRange.WEEK_1] - The time range for the query.
 * @returns {Promise<TransactionVolumeWithComparison>} - The transaction volume data with comparison.
 */
const getTxVolume: MetricFunction<TransactionVolumeWithComparison> = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  userId: string,
  limit?: number
): Promise<TransactionVolumeWithComparison> => {
  const data = await logAndFetch(
    txVolumeQuery.getContractTxVolume,
    contractIds,
    timeRange,
    `Fetching transaction volume for contracts ${contractIds.join(',')} over ${timeRange}`
  );

  const intervalVolumes = data.map(
    ({ date, transaction_count }: { date: any; transaction_count: any }) => ({
      date: date.value,
      transactionCount: transaction_count
    })
  );

  const totalVolume = data.reduce(
    (sum: any, { transaction_count }: { transaction_count: any }) => sum + transaction_count,
    0
  );
  const { absoluteChange, percentageChange } = calculateChanges(
    totalVolume,
    data[0].previous_transaction_count
  );

  return {
    intervalVolumes,
    totalVolume,
    comparedTotalVolume: {
      previousCount: data[0].previous_transaction_count,
      absoluteChange,
      percentageChange
    }
  };
};

/**
 * Fetches transaction success rate data for the given contracts and time range.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} [timeRange=TimeRange.WEEK_1] - The time range for the query.
 * @returns {Promise<TransactionSuccessRateWithComparison>} - The transaction success rate data with comparison.
 */
const getTxSuccessRate: MetricFunction<TransactionSuccessRateWithComparison> = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  userId: string,
  limit?: number
): Promise<TransactionSuccessRateWithComparison> => {
  const data = await logAndFetch(
    txSuccessRateQuery.getContractTxSuccessRate,
    contractIds,
    timeRange,
    `Fetching transaction success rate for contracts ${contractIds.join(',')} over ${timeRange}`
  );

  const intervalSuccessRates = data.map(
    ({
      date,
      transaction_count,
      successful_transactions,
      failed_transactions
    }: {
      date: any;
      transaction_count: any;
      successful_transactions: any;
      failed_transactions: any;
    }) => ({
      date: date.value,
      transactionCount: transaction_count,
      successfulTransactions: successful_transactions,
      failedTransactions: failed_transactions,
      intervalSuccessRate: roundTo((successful_transactions / transaction_count) * 100, 2),
      intervalFailureRate: roundTo((failed_transactions / transaction_count) * 100, 2)
    })
  );

  const overallSuccessRate = roundTo(
    (data[0].total_successful / data[0].total_transactions) * 100,
    2
  );
  const overallFailureRate = roundTo((data[0].total_failed / data[0].total_transactions) * 100, 2);

  const comparedOverallSuccessRate = calculateChanges(
    overallSuccessRate,
    roundTo((data[0].previous_total_successful / data[0].previous_total_transactions) * 100, 2)
  );
  const comparedOverallFailureRate = calculateChanges(
    overallFailureRate,
    roundTo((data[0].previous_total_failed / data[0].previous_total_transactions) * 100, 2)
  );

  return {
    intervalSuccessRates,
    totalTransactions: data[0].total_transactions,
    totalSuccessful: data[0].total_successful,
    totalFailed: data[0].total_failed,
    overallSuccessRate,
    overallFailureRate,
    comparedTotalTransactions: calculateChanges(
      data[0].total_transactions,
      data[0].previous_total_transactions
    ),
    comparedTotalSuccessful: calculateChanges(
      data[0].total_successful,
      data[0].previous_total_successful
    ),
    comparedTotalFailed: calculateChanges(data[0].total_failed, data[0].previous_total_failed),
    comparedOverallSuccessRate,
    comparedOverallFailureRate
  };
};

/**
 * Fetches unique users data for the given contracts and time range.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} [timeRange=TimeRange.WEEK_1] - The time range for the query.
 * @returns {Promise<UniqueUsersWithComparison>} - The unique users data with comparison.
 */
const getUniqueUsers: MetricFunction<UniqueUsersWithComparison> = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  userId: string,
  limit?: number
): Promise<UniqueUsersWithComparison> => {
  const data = await logAndFetch(
    uniqueUsersQuery.getContractUniqueUsers,
    contractIds,
    timeRange,
    `Fetching unique users for contracts ${contractIds.join(',')} over ${timeRange}`
  );

  const intervalUniqueUsers = data.map(
    ({ date, unique_users }: { date: any; unique_users: any }) => ({
      date: date.value,
      uniqueUsers: unique_users
    })
  );

  const { absoluteChange, percentageChange } = calculateChanges(
    data[0].total_unique_users,
    data[0].previous_total_unique_users
  );

  return {
    intervalUniqueUsers,
    totalUniqueUsers: data[0].total_unique_users,
    comparedTotalUniqueUsers: {
      previousCount: data[0].previous_total_unique_users,
      absoluteChange,
      percentageChange
    }
  };
};

/**
 * Fetches transaction fees data for the given contracts and time range.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} [timeRange=TimeRange.WEEK_1] - The time range for the query.
 * @returns {Promise<TransactionFeesWithComparison>} - The transaction fees data with comparison.
 */
const getTxFees: MetricFunction<TransactionFeesWithComparison> = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  userId: string,
  limit?: number
): Promise<TransactionFeesWithComparison> => {
  const data = await logAndFetch(
    txFeesQuery.getContractTxFees,
    contractIds,
    timeRange,
    `Fetching transaction fees for contracts ${contractIds.join(',')} over ${timeRange}`
  );

  const intervalFees = data.map(
    ({
      date,
      total_fees,
      avg_fee,
      transaction_count
    }: {
      date: any;
      total_fees: any;
      avg_fee: any;
      transaction_count: any;
    }) => ({
      date: date.value,
      totalFees: total_fees,
      avgFee: roundTo(avg_fee, 2),
      transactionCount: transaction_count
    })
  );

  return {
    intervalFees,
    overallTotalFees: data[0].overall_total_fees,
    overallAvgFee: roundTo(data[0].overall_avg_fee, 2),
    overallTotalTransactions: data[0].overall_total_transactions,
    comparedOverallTotalFees: calculateChanges(
      data[0].overall_total_fees,
      data[0].previous_overall_total_fees
    ),
    comparedOverallAvgFee: calculateChanges(
      roundTo(data[0].overall_avg_fee, 2),
      roundTo(data[0].previous_overall_avg_fee, 2)
    ),
    comparedOverallTotalTransactions: calculateChanges(
      data[0].overall_total_transactions,
      data[0].previous_overall_total_transactions
    )
  };
};

/**
 * Fetches top events data for the given contracts and time range.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} [timeRange=TimeRange.WEEK_1] - The time range for the query.
 * @param {number} [limit=DEFAULT_LIMIT] - The maximum number of top events to fetch.
 * @param {string} userId - The user ID to fetch contract nickname for.
 * @returns {Promise<TopEvent[]>} - The top events data.
 */
const getTopEvents: MetricFunction<TopEvent[]> = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  userId: string,
  limit: number = DEFAULT_LIMIT
): Promise<TopEvent[]> => {
  const data = await logAndFetchWithLimit(
    topEventsQuery.getTopContractEvents,
    contractIds,
    timeRange,
    limit,
    `Fetching top events for contracts ${contractIds.join(',')} over ${timeRange}`
  );

  return Promise.all(
    data.map(
      async ({
        contract_id,
        event_name,
        current_count,
        previous_count
      }: {
        contract_id: any;
        event_name: any;
        current_count: any;
        previous_count: any;
      }) => {
        const contractNickname = userId
          ? await savedContractService.getContractNickname(contract_id, userId)
          : undefined;
        return {
          contractId: contract_id,
          contractNickname,
          eventName: event_name,
          eventCount: current_count,
          compared: calculateChanges(current_count, previous_count)
        };
      }
    )
  );
};

/**
 * Fetches top users data for the given contracts and time range.
 * @param {string[]} contractIds - The IDs of the contracts.
 * @param {TimeRange} [timeRange=TimeRange.WEEK_1] - The time range for the query.
 * @param {number} [limit=DEFAULT_LIMIT] - The maximum number of top users to fetch.
 * @param {string} userId - The user ID to fetch contract nickname for.
 * @returns {Promise<TopUser[]>} - The top users data.
 */
const getTopUsers: MetricFunction<TopUser[]> = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  userId: string,
  limit: number = DEFAULT_LIMIT
): Promise<TopUser[]> => {
  const data = await logAndFetchWithLimit(
    topUsersQuery.getTopContractUsers,
    contractIds,
    timeRange,
    limit,
    `Fetching top users for contracts ${contractIds.join(',')} over ${timeRange}`
  );

  return Promise.all(
    data.map(
      async ({
        contract_id,
        user,
        current_count,
        previous_count
      }: {
        contract_id: any;
        user: any;
        current_count: any;
        previous_count: any;
      }) => {
        const contractNickname = userId
          ? await savedContractService.getContractNickname(contract_id, userId)
          : undefined;
        return {
          contractId: contract_id,
          contractNickname,
          user: user,
          transactionCount: current_count,
          compared: calculateChanges(current_count, previous_count)
        };
      }
    )
  );
};

const metricsService: MetricsService = {
  getTxVolume,
  getTxSuccessRate,
  getUniqueUsers,
  getTxFees,
  getTopEvents,
  getTopUsers
};

export default metricsService;
