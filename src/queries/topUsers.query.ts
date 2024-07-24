import bigquery from '../config/bigquery';
import { DEFAULT_LIMIT } from '../config/constants';
import { TimeRange } from '../types/timeRange';
import { getPreviousInterval, timeRangeToInterval } from '../utils/bigqueryHelpers';

/**
 * Generates a BigQuery SQL query for fetching top Soroban contract users
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @param limit - The maximum number of top users to return (optional)
 * @returns A BigQuery SQL query string
 */
const getTopContractUsersQuery = (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  limit?: number
): string => {
  const interval = timeRangeToInterval(timeRange);
  const previousInterval = getPreviousInterval(timeRange);
  const limitClause = limit ? `LIMIT ${limit}` : '';

  return `
    WITH current_users AS (
      SELECT
        contract_id,
        op_source_account AS user,
        COUNT(*) AS current_count
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\`
      WHERE
        contract_id IN UNNEST(@contractIds)
        AND closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        contract_id, user
    ),
    previous_users AS (
      SELECT
        contract_id,
        op_source_account AS user,
        COUNT(*) AS previous_count
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\`
      WHERE
        contract_id IN UNNEST(@contractIds)
        AND closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${previousInterval})
        AND closed_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        contract_id, user
    )
    SELECT
      cu.contract_id,
      cu.user,
      cu.current_count,
      IFNULL(pu.previous_count, 0) AS previous_count
    FROM
      current_users cu
    LEFT JOIN
      previous_users pu
    ON
      cu.contract_id = pu.contract_id AND cu.user = pu.user
    ORDER BY
      cu.current_count DESC
    ${limitClause}
  `;
};

/**
 * Executes a BigQuery query to fetch top Soroban contract users
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @param limit - The maximum number of top users to return (optional)
 * @returns An array of top user data
 * @throws Error if the BigQuery execution fails
 */
const getTopContractUsers = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  limit: number = DEFAULT_LIMIT
): Promise<any[]> => {
  const query = getTopContractUsersQuery(contractIds, timeRange, limit);
  const options = {
    query: query,
    params: { contractIds: contractIds }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch top Soroban contract users');
  }
};

export default {
  getTopContractUsers
};
