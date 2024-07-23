import bigquery from '../config/bigquery';
import { DEFAULT_LIMIT } from '../config/constants';

/**
 * Generates a BigQuery SQL query for fetching recent Soroban contract transactions
 * @param contractIds - The IDs of the Soroban contracts
 * @param limit - The maximum number of transactions to fetch (default: 10)
 * @returns A BigQuery SQL query string
 */
const getRecentContractTxQuery = (contractIds: string[], limit: number = DEFAULT_LIMIT): string => {
  return `
    SELECT
      soroban_operations.contract_id,
      soroban_operations.op_source_account,
      soroban_operations.transaction_hash,
      soroban_operations.ledger_sequence,
      soroban_operations.txn_created_at,
      soroban_operations.function as function_name,
      soroban_operations.parameters_decoded as parameters,
      soroban_operations.successful,
      soroban_operations.fee_charged
    FROM
      \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` AS soroban_operations
    WHERE
      soroban_operations.contract_id IN UNNEST(@contractIds)
    ORDER BY
      soroban_operations.txn_created_at DESC
    LIMIT @limit
  `;
};

/**
 * Executes a BigQuery query to fetch recent Soroban contract transactions
 * @param contractIds - The IDs of the Soroban contracts
 * @param limit - The maximum number of transactions to fetch (default: 10)
 * @returns An array of recent transaction data
 * @throws Error if the BigQuery execution fails
 */
const getRecentContractTx = async (
  contractIds: string[],
  limit: number = DEFAULT_LIMIT
): Promise<any[]> => {
  const query = getRecentContractTxQuery(contractIds, limit);
  const options = {
    query: query,
    params: { contractIds: contractIds, limit: limit }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery:', error);
    throw new Error('Failed to fetch recent Soroban contract transactions');
  }
};

export default {
  getRecentContractTx
};
