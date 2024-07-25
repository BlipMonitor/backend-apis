import bigquery from '../config/bigquery';
import { TimeRange } from '../types/timeRange';
import {
  getGroupByClause,
  getPreviousInterval,
  timeRangeToInterval
} from '../utils/bigqueryHelpers';

/**
 * Generates a BigQuery SQL query for fetching Soroban contract transaction fees
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns A BigQuery SQL query string
 */
const getContractTxFeesQuery = (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): string => {
  const interval = timeRangeToInterval(timeRange);
  const previousInterval = getPreviousInterval(timeRange);
  const groupBy = getGroupByClause(timeRange);

  return `
    WITH daily_fees AS (
      SELECT
        soroban_operations.contract_id,
        ${groupBy} AS date,
        SUM(soroban_operations.fee_charged) AS total_fees,
        AVG(soroban_operations.fee_charged) AS avg_fee,
        COUNT(DISTINCT soroban_operations.transaction_id) AS transaction_count
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        soroban_operations.contract_id, date
    ),
    overall_fees AS (
      SELECT
        SUM(total_fees) AS overall_total_fees,
        AVG(avg_fee) AS overall_avg_fee,
        SUM(transaction_count) AS overall_total_transactions
      FROM daily_fees
    ),
    previous_overall_fees AS (
      SELECT
        SUM(soroban_operations.fee_charged) AS previous_overall_total_fees,
        AVG(soroban_operations.fee_charged) AS previous_overall_avg_fee,
        COUNT(DISTINCT soroban_operations.transaction_id) AS previous_overall_total_transactions
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
      WHERE
        soroban_operations.contract_id IN UNNEST(@contractIds)
        AND soroban_operations.closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${previousInterval})
        AND soroban_operations.closed_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
    )
    SELECT
      df.date,
      SUM(df.total_fees) AS total_fees,
      AVG(df.avg_fee) AS avg_fee,
      SUM(df.transaction_count) AS transaction_count,
      ovf.overall_total_fees,
      ovf.overall_avg_fee,
      ovf.overall_total_transactions,
      IFNULL(pof.previous_overall_total_fees, 0) AS previous_overall_total_fees,
      IFNULL(pof.previous_overall_avg_fee, 0) AS previous_overall_avg_fee,
      IFNULL(pof.previous_overall_total_transactions, 0) AS previous_overall_total_transactions
    FROM daily_fees df
    CROSS JOIN overall_fees ovf
    CROSS JOIN previous_overall_fees pof
    GROUP BY df.date, ovf.overall_total_fees, ovf.overall_avg_fee, ovf.overall_total_transactions, pof.previous_overall_total_fees, pof.previous_overall_avg_fee, pof.previous_overall_total_transactions
    ORDER BY df.date DESC
  `;
};

/**
 * Executes a BigQuery query to fetch Soroban contract transaction fees
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @returns An array of transaction fees data
 * @throws Error if the BigQuery execution fails
 */
const getContractTxFees = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1
): Promise<any[]> => {
  const query = getContractTxFeesQuery(contractIds, timeRange);
  const options = {
    query: query,
    params: { contractIds: contractIds }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch Soroban contract transaction fees data');
  }
};

export default {
  getContractTxFees
};
