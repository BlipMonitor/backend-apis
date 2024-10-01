import bigquery from '../config/bigquery';
import { DEFAULT_LIMIT } from '../config/constants';

/**
 * Generates a BigQuery SQL query for fetching recent Soroban contract alerts
 * @param contractIds - The IDs of the Soroban contracts
 * @param limit - The maximum number of alerts to fetch (default: 10)
 * @returns A BigQuery SQL query string
 */
const getRecentContractAlertsQuery = (
  contractIds: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limit: number = DEFAULT_LIMIT
): string => {
  return `
    WITH hourly_error_rate AS (
      SELECT
        contract_id,
        TIMESTAMP_TRUNC(closed_at, HOUR) AS hour,
        COUNT(*) AS total_transactions,
        COUNTIF(successful = FALSE) AS failed_transactions,
        COUNTIF(successful = FALSE) / COUNT(*) AS error_rate
      FROM
        \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\`
      WHERE
        contract_id IN UNNEST(@contractIds)
      GROUP BY
        contract_id, hour
      HAVING
        COUNTIF(successful = FALSE) / COUNT(*) > 0.01
    )
    SELECT
      contract_id,
      hour AS alert_time,
      total_transactions,
      failed_transactions,
      error_rate
    FROM
      hourly_error_rate
    ORDER BY
      alert_time DESC
    LIMIT @limit
  `;
};

/**
 * Executes a BigQuery query to fetch recent Soroban contract alerts
 * @param contractIds - The IDs of the Soroban contracts
 * @param limit - The maximum number of alerts to fetch (default: 10)
 * @returns An array of recent alert data
 * @throws Error if the BigQuery execution fails
 */
const getRecentAlerts = async (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT
): Promise<any[]> => {
  const query = getRecentContractAlertsQuery(contractIds, limit);
  const options = {
    query: query,
    params: { contractIds: contractIds, limit: limit }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch recent Soroban contract alerts');
  }
};

export default {
  getRecentAlerts
};
