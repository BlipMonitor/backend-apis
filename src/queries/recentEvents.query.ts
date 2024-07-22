import bigquery from '../config/bigquery';
import { DEFAULT_LIMIT } from '../config/constants';

/**
 * Generates a BigQuery SQL query for fetching recent Soroban contract events
 * @param contractIds - The IDs of the Soroban contracts
 * @param limit - The maximum number of events to fetch (default: 10)
 * @returns A BigQuery SQL query string
 */
const getRecentContractEventsQuery = (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT
): string => {
  return `
      SELECT
        contract_id,
        transaction_hash,
        ledger_sequence,
        closed_at,
        type_string,
        topics_decoded,
        data_decoded,
        successful,
        in_successful_contract_call
      FROM
        \`crypto-stellar.crypto_stellar.history_contract_events\`
      WHERE
        contract_id IN UNNEST(@contractIds)
      ORDER BY
        closed_at DESC
      LIMIT @limit
  `;
};

/**
 * Executes a BigQuery query to fetch recent Soroban contract events
 * @param contractIds - The IDs of the Soroban contracts
 * @param limit - The maximum number of events to fetch (default: 10)
 * @returns An array of recent event data
 * @throws Error if the BigQuery execution fails
 */
const getRecentContractEvents = async (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT
): Promise<any[]> => {
  const query = getRecentContractEventsQuery(contractIds, limit);
  const options = {
    query: query,
    params: { contractIds: contractIds, limit: limit }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch recent Soroban contract events');
  }
};

export default {
  getRecentContractEvents
};
