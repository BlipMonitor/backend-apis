import { BigQuery } from '@google-cloud/bigquery';

import config from './config';
import logger from './logger';

// add bigquery to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  bigquery: BigQuery;
}

// Prevent multiple instances of BigQuery Client in development
declare const global: CustomNodeJsGlobal;

const bigquery = global.bigquery || new BigQuery();

if (config.env === 'development') global.bigquery = bigquery;

/**
 * Test BigQuery connection
 * @param {string} dataset - The dataset name
 * @param {string} table - The table name
 * @returns {Promise<boolean>}
 */
export const testBigQueryConnection = async (): Promise<boolean> => {
  try {
    const query = `SELECT COUNT(*) as count FROM \`crypto-stellar.crypto_stellar_dbt.enriched_history_operations_soroban\` LIMIT 1`;
    const [job] = await bigquery.createQueryJob({ query });
    await job.getQueryResults();
    return true;
  } catch (error) {
    logger.error('Error testing BigQuery connection:', error);
    return false;
  }
};

export default bigquery;
