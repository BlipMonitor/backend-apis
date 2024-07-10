import { RequireAuthProp } from '@clerk/clerk-sdk-node';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import logger from '../config/logger';
import { historyService, savedContractService } from '../services';
import catchAsync from '../utils/catchAsync';
import { parseLimit } from '../utils/requestParsers';

/**
 * Type alias for the keys of the historyService object.
 * This ensures type safety when accessing history functions.
 */
type HistoryType = keyof typeof historyService;

/**
 * Higher-order function that creates a controller for fetching history for a single contract.
 * @param {HistoryType} historyType - The type of history to fetch (e.g., 'getRecentTx', 'getRecentEvents').
 * @returns {Function} An async function that handles the request and sends the response.
 */
const getHistory = (historyType: HistoryType) =>
  catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
    // Extract necessary data from the request
    const { contractId } = req.params;
    const limit = parseLimit(req.query.limit);
    const userId = req.auth.userId;

    // Log the history request
    logger.info(`Requesting ${historyType} for contract ${contractId} with limit ${limit}`);

    // Fetch the history data using the appropriate service function
    const data = await historyService[historyType]([contractId], limit, userId);

    // Send the response
    res.status(httpStatus.OK).send(data);
  });

/**
 * Higher-order function that creates a controller for fetching history for all contracts of a user.
 * @param {HistoryType} historyType - The type of history to fetch (e.g., 'getRecentTx', 'getRecentEvents').
 * @returns {Function} An async function that handles the request and sends the response.
 */
const getAllHistory = (historyType: HistoryType) =>
  catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
    // Extract necessary data from the request
    const userId = req.auth.userId;
    const limit = parseLimit(req.query.limit);

    // Fetch all saved contracts for the user
    const contractIds = await getContractIdsForUser(userId);

    // Log the history request
    logger.info(
      `Requesting ${historyType} for contracts ${contractIds.join(', ')} with limit ${limit}`
    );

    // Fetch the history data using the appropriate service function
    const data = await historyService[historyType](contractIds, limit, userId);

    // Send the response
    res.status(httpStatus.OK).send(data);
  });

/**
 * Helper function to get all contract IDs for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise that resolves to an array of contract IDs.
 */
const getContractIdsForUser = async (userId: string): Promise<string[]> => {
  const savedContracts = await savedContractService.querySavedContracts({ userId }, {});
  return savedContracts.results.map(({ contractId }) => contractId);
};

// Export an object with all the history controller functions
export default {
  getContractRecentTx: getHistory('getRecentTx'),
  getAllContractsRecentTx: getAllHistory('getRecentTx'),
  getContractRecentEvents: getHistory('getRecentEvents'),
  getAllContractsRecentEvents: getAllHistory('getRecentEvents'),
  getContractRecentAlerts: getHistory('getRecentAlerts'),
  getAllContractsRecentAlerts: getAllHistory('getRecentAlerts')
};
