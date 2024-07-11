import { RequireAuthProp } from '@clerk/clerk-sdk-node';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import logger from '../config/logger';
import { savedContractService } from '../services';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';

/**
 * Create a new saved contract
 * @route POST /api/v1/saved-contracts
 */
const createSavedContract = catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
  const { contractId, nickname } = req.body;
  const userId = req.auth.userId;
  logger.info(`Creating saved contract for user ${userId}, contract ${contractId}`);
  const savedContract = await savedContractService.createSavedContract(
    userId,
    contractId,
    nickname
  );
  res.status(httpStatus.CREATED).send(savedContract);
});

/**
 * Get all saved contracts for a user
 * @route GET /api/v1/saved-contracts
 */
const getSavedContracts = catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
  const userId = req.auth.userId;
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  logger.info(`Fetching saved contracts for user ${userId}`);
  const result = await savedContractService.querySavedContracts({ userId }, options);
  res.status(httpStatus.OK).send(result);
});

/**
 * Get a specific saved contract
 * @route GET /api/v1/saved-contracts/:id
 */
const getSavedContract = catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
  const userId = req.auth.userId;
  const { id: contractId } = req.params;
  logger.info(`Fetching saved contract ${contractId} for user ${userId}`);
  const savedContract = await savedContractService.getSavedContractById(contractId, userId);
  if (!savedContract) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Saved contract not found');
  }
  res.status(httpStatus.OK).send(savedContract);
});

/**
 * Update a saved contract
 * @route PATCH /api/v1/saved-contracts/:id
 */
const updateSavedContract = catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
  const userId = req.auth.userId;
  const { id: contractId } = req.params;
  logger.info(`Updating saved contract ${contractId} for user ${userId}`);
  const savedContract = await savedContractService.updateSavedContractById(
    contractId,
    userId,
    req.body
  );
  res.status(httpStatus.OK).send(savedContract);
});

/**
 * Delete a saved contract
 * @route DELETE /api/v1/saved-contracts/:id
 */
const deleteSavedContract = catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
  const userId = req.auth.userId;
  const { id: contractId } = req.params;
  logger.info(`Deleting saved contract ${contractId} for user ${userId}`);
  await savedContractService.deleteSavedContractById(contractId, userId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Set a contract as default
 * @route POST /api/v1/saved-contracts/:id/set-default
 */
const setDefaultContract = catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
  const userId = req.auth.userId;
  const { id: contractId } = req.params;
  logger.info(`Setting contract ${contractId} as default for user ${userId}`);
  await savedContractService.setDefaultContract(userId, contractId);
  res.status(httpStatus.OK).send({ message: 'Default contract set successfully' });
});

export default {
  createSavedContract,
  getSavedContracts,
  getSavedContract,
  updateSavedContract,
  deleteSavedContract,
  setDefaultContract
};
