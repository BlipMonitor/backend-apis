import bigquery from '../config/bigquery';
import { TimeRange } from '../types/timeRange';
import {
  getGroupByClause,
  getPreviousInterval,
  timeRangeToInterval
} from '../utils/bigqueryHelpers';

/**
 * Generates a BigQuery SQL query for fetching Soroban contract transaction volume
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns A BigQuery SQL query string
 */
const getContractTxVolumeQuery = (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): string => {
  const interval = timeRangeToInterval(timeRange);
  const previousInterval = getPreviousInterval(timeRange);
  const groupBy = getGroupByClause(timeRange);

  return `
    WITH current_period AS (
      SELECT
        ${groupBy} AS date,
        COUNT(DISTINCT soroban_operations.transaction_id) AS transaction_count
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        date
    ),
    current_total AS (
      SELECT
        SUM(transaction_count) AS total_transaction_count
      FROM current_period
    ),
    previous_period AS (
      SELECT
        COUNT(DISTINCT soroban_operations.transaction_id) AS previous_transaction_count
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${previousInterval})
        AND soroban_operations.closed_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
    )
    SELECT
      cp.date,
      cp.transaction_count,
      ct.total_transaction_count,
      IFNULL(pp.previous_transaction_count, 0) AS previous_transaction_count
    FROM current_period cp
    CROSS JOIN current_total ct
    CROSS JOIN previous_period pp
    ORDER BY
      cp.date DESC
  `;
};

/**
 * Executes a BigQuery query to fetch Soroban contract transaction volume
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns An array of transaction volume data
 * @throws Error if the BigQuery execution fails
 */
const getContractTxVolume = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): Promise<any[]> => {
  const query = getContractTxVolumeQuery(contractIds, timeRange);
  const options = {
    query: query,
    params: { contractIds: contractIds }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch Soroban contract transaction volume data');
  }
};

export default {
  getContractTxVolume
};
