import bigquery from '../config/bigquery';

/**
 * Generates a BigQuery SQL query for fetching Soroban contract alerts within a specified time range
 * @param contractIds - The IDs of the Soroban contracts
 * @param startTime - The start time of the range to fetch alerts for
 * @param endTime - The end time of the range to fetch alerts for
 * @returns A BigQuery SQL query string
 */
const getHourlyContractAlertsQuery = (
  contractIds: string[],
  startTime: Date,
  endTime: Date
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
        AND closed_at BETWEEN @startTime AND @endTime
      GROUP BY
        contract_id, hour
      HAVING
        COUNTIF(successful = FALSE) / COUNT(*) > 0.05
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
  `;
};

/**
 * Executes a BigQuery query to fetch Soroban contract alerts within a specified time range
 * @param contractIds - The IDs of the Soroban contracts
 * @param startTime - The start time of the range to fetch alerts for
 * @param endTime - The end time of the range to fetch alerts for
 * @returns An array of alert data
 * @throws Error if the BigQuery execution fails
 */
const getHourlyAlerts = async (
  contractIds: string[],
  startTime: Date,
  endTime: Date
): Promise<any[]> => {
  const query = getHourlyContractAlertsQuery(contractIds, startTime, endTime);
  const options = {
    query: query,
    params: { contractIds: contractIds, startTime: startTime, endTime: endTime }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch hourly Soroban contract alerts');
  }
};

export default {
  getHourlyAlerts
};
