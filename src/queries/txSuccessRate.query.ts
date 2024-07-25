import bigquery from '../config/bigquery';
import { TimeRange } from '../types/timeRange';
import {
  getGroupByClause,
  getPreviousInterval,
  timeRangeToInterval
} from '../utils/bigqueryHelpers';

/**
 * Generates a BigQuery SQL query for fetching Soroban contract transaction success rates
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns A BigQuery SQL query string
 */
const getContractTxSuccessRateQuery = (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): string => {
  const interval = timeRangeToInterval(timeRange);
  const previousInterval = getPreviousInterval(timeRange);
  const groupBy = getGroupByClause(timeRange);

  return `
    WITH interval_counts AS (
      SELECT
        ${groupBy} AS date,
        COUNT(DISTINCT soroban_operations.transaction_id) AS transaction_count,
        COUNTIF(soroban_operations.successful = TRUE) AS successful_transactions,
        COUNTIF(soroban_operations.successful = FALSE) AS failed_transactions
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        date
    ),
    totals AS (
      SELECT
        SUM(transaction_count) AS total_transactions,
        SUM(successful_transactions) AS total_successful,
        SUM(failed_transactions) AS total_failed
      FROM interval_counts
    ),
    previous_totals AS (
      SELECT
        COUNT(DISTINCT soroban_operations.transaction_id) AS previous_total_transactions,
        COUNTIF(soroban_operations.successful = TRUE) AS previous_total_successful,
        COUNTIF(soroban_operations.successful = FALSE) AS previous_total_failed
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${previousInterval})
        AND soroban_operations.closed_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
    )
    SELECT
      dc.date,
      dc.transaction_count,
      dc.successful_transactions,
      dc.failed_transactions,
      t.total_transactions,
      t.total_successful,
      t.total_failed,
      IFNULL(pt.previous_total_successful, 0) AS previous_total_successful,
      IFNULL(pt.previous_total_failed, 0) AS previous_total_failed,
      IFNULL(pt.previous_total_transactions, 0) AS previous_total_transactions
    FROM interval_counts dc
    CROSS JOIN totals t
    CROSS JOIN previous_totals pt
    ORDER BY
      dc.date DESC
  `;
};

/**
 * Executes a BigQuery query to fetch Soroban contract transaction success rates
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns An array of transaction success rate data
 * @throws Error if the BigQuery execution fails
 */
const getContractTxSuccessRate = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): Promise<any[]> => {
  const query = getContractTxSuccessRateQuery(contractIds, timeRange);
  const options = {
    query: query,
    params: { contractIds: contractIds }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch Soroban contract transaction success rate data');
  }
};

export default {
  getContractTxSuccessRate
};
