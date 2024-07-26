import bigquery from '../config/bigquery';
import { TimeRange } from '../types/timeRange';
import {
  getGroupByClause,
  getPreviousInterval,
  timeRangeToInterval
} from '../utils/bigqueryHelpers';

/**
 * Generates a BigQuery SQL query for fetching Soroban contract unique users
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns A BigQuery SQL query string
 */
const getContractUniqueUsersQuery = (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): string => {
  const interval = timeRangeToInterval(timeRange);
  const previousInterval = getPreviousInterval(timeRange);
  const groupBy = getGroupByClause(timeRange);

  return `
    WITH daily_counts AS (
      SELECT
        ${groupBy} AS date,
        COUNT(DISTINCT soroban_operations.op_source_account) AS unique_users
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        date
    ),
    total_unique_users AS (
      SELECT
        COUNT(DISTINCT soroban_operations.op_source_account) AS total_unique_users
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
    ),
    previous_total_unique_users AS (
      SELECT
        COUNT(DISTINCT soroban_operations.op_source_account) AS previous_total_unique_users
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${previousInterval})
        AND soroban_operations.closed_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
    )
    SELECT
      dc.date,
      dc.unique_users,
      tu.total_unique_users,
      IFNULL(ptu.previous_total_unique_users, 0) AS previous_total_unique_users
    FROM daily_counts dc
    CROSS JOIN total_unique_users tu
    CROSS JOIN previous_total_unique_users ptu
    ORDER BY
      dc.date DESC
  `;
};

/**
 * Executes a BigQuery query to fetch Soroban contract unique users
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns An array of unique users data
 * @throws Error if the BigQuery execution fails
 */
const getContractUniqueUsers = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): Promise<any[]> => {
  const query = getContractUniqueUsersQuery(contractIds, timeRange);
  const options = {
    query: query,
    params: { contractIds: contractIds }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch Soroban contract unique users data');
  }
};

export default {
  getContractUniqueUsers
};
