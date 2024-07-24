import bigquery from '../config/bigquery';
import { DEFAULT_LIMIT } from '../config/constants';
import { TimeRange } from '../types/timeRange';
import { getPreviousInterval, timeRangeToInterval } from '../utils/bigqueryHelpers';

/**
 * Generates a BigQuery SQL query for fetching top Soroban contract events
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @param limit - The maximum number of top events to return (optional)
 * @returns A BigQuery SQL query string
 */
const getTopContractEventsQuery = (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  limit?: number
): string => {
  const interval = timeRangeToInterval(timeRange);
  const previousInterval = getPreviousInterval(timeRange);
  const limitClause = limit ? `LIMIT ${limit}` : '';

  return `
    WITH current_events AS (
      SELECT
        contract_id,
        JSON_EXTRACT_SCALAR(JSON_EXTRACT(topics_decoded, '$.topics_decoded[1]'), '$.value') AS event_name,
        COUNT(*) AS current_count
      FROM
        \`crypto-stellar.crypto_stellar.history_contract_events\`
      WHERE
        contract_id IN UNNEST(@contractIds)
        AND closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        contract_id, event_name
    ),
    previous_events AS (
      SELECT
        contract_id,
        JSON_EXTRACT_SCALAR(JSON_EXTRACT(topics_decoded, '$.topics_decoded[1]'), '$.value') AS event_name,
        COUNT(*) AS previous_count
      FROM
        \`crypto-stellar.crypto_stellar.history_contract_events\`
      WHERE
        contract_id IN UNNEST(@contractIds)
        AND closed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${previousInterval})
        AND closed_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), ${interval})
      GROUP BY
        contract_id, event_name
    )
    SELECT
      ce.contract_id,
      ce.event_name,
      ce.current_count,
      IFNULL(pe.previous_count, 0) AS previous_count
    FROM
      current_events ce
    LEFT JOIN
      previous_events pe
    ON
      ce.contract_id = pe.contract_id AND ce.event_name = pe.event_name
    ORDER BY
      ce.current_count DESC
    ${limitClause}
  `;
};

/**
 * Executes a BigQuery query to fetch top Soroban contract events
 * @param contractIds - The IDs of the Soroban contracts
 * @param timeRange - The time range for the query
 * @param limit - The maximum number of top events to return (optional)
 * @returns An array of top event data
 * @throws Error if the BigQuery execution fails
 */
const getTopContractEvents = async (
  contractIds: string[],
  timeRange: TimeRange = TimeRange.WEEK_1,
  limit: number = DEFAULT_LIMIT
): Promise<any[]> => {
  const query = getTopContractEventsQuery(contractIds, timeRange, limit);
  const options = {
    query: query,
    params: { contractIds: contractIds }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch top Soroban contract events');
  }
};

export default {
  getTopContractEvents
};
