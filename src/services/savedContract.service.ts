import { SavedContract } from '@prisma/client';
import httpStatus from 'http-status';

import { DEFAULT_LIMIT } from '../config/constants';
import logger from '../config/logger';
import prisma from '../config/prisma';
import ApiError from '../utils/ApiError';
import { validateAndSanitizeContractId } from '../utils/contractValidation';

/**
 * Create a saved contract
 * @param {number} userId - The ID of the user creating the saved contract
 * @param {string} contractId - The ID of the contract to be saved
 * @param {string} [nickname] - Optional nickname for the saved contract
 * @returns {Promise<SavedContract & { isDefault: boolean; nickname: string }>}
 */
const createSavedContract = async (
  userId: string,
  contractId: string,
  nickname?: string
): Promise<SavedContract & { isDefault: boolean; nickname: string }> => {
  contractId = validateAndSanitizeContractId(contractId);

  try {
    return await prisma.$transaction(async (tx) => {
      let savedContract = await tx.savedContract.findUnique({ where: { contractId } });
      if (!savedContract) {
        savedContract = await tx.savedContract.create({ data: { contractId } });
        logger.info(`Created new SavedContract: ${savedContract.id}`);
      }

      const existingUserSavedContract = await tx.userSavedContract.findUnique({
        where: { userId_contractId: { userId, contractId: savedContract.contractId } }
      });

      if (existingUserSavedContract) {
        logger.warn(`Contract already saved by user: ${userId}, ${contractId}`);
        throw new ApiError(httpStatus.CONFLICT, 'Contract already saved by user');
      }

      const isFirstContract = !(await tx.userSavedContract.findFirst({ where: { userId } }));

      const userSavedContract = await tx.userSavedContract.create({
        data: {
          userId,
          contractId: savedContract.contractId,
          nickname: nickname || `Contract ${savedContract.contractId.slice(0, 8)}`,
          isDefault: isFirstContract
        }
      });

      return {
        ...savedContract,
        isDefault: userSavedContract.isDefault,
        nickname: userSavedContract.nickname
      };
    });
  } catch (error) {
    logger.error('Error in createSavedContract:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while saving the contract'
    );
  }
};

/**
 * Query for saved contracts
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {string} [options.sortOrder] - Sort order (default = desc)
 * @returns {Promise<QueryResult>}
 */
const querySavedContracts = async (
  filter: { userId: string },
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{
  results: (SavedContract & { isDefault: boolean; nickname: string })[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}> => {
  const { page = 1, limit = DEFAULT_LIMIT, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  const [results, totalResults] = await Promise.all([
    prisma.userSavedContract.findMany({
      where: { userId: filter.userId },
      include: {
        contract: true
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.userSavedContract.count({ where: { userId: filter.userId } })
  ]);

  return {
    results: results.map(({ contract, isDefault, nickname }) => ({
      ...contract,
      isDefault,
      nickname
    })),
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults
  };
};

/**
 * Get saved contract by id
 * @param {string} id - Saved contract id
 * @param {number} userId - User id
 * @returns {Promise<(SavedContract & { isDefault: boolean; nickname: string }) | null>}
 */
const getSavedContractById = async (
  id: string,
  userId: string
): Promise<(SavedContract & { isDefault: boolean; nickname: string }) | null> => {
  id = validateAndSanitizeContractId(id);
  const userSavedContract = await prisma.userSavedContract.findUnique({
    where: {
      userId_contractId: {
        userId,
        contractId: id
      }
    },
    include: {
      contract: true
    }
  });

  if (!userSavedContract) throw new ApiError(httpStatus.NOT_FOUND, 'Saved contract not found');

  return {
    ...userSavedContract.contract,
    isDefault: userSavedContract.isDefault,
    nickname: userSavedContract.nickname
  };
};

/**
 * Update saved contract by id
 * @param {string} id - Saved contract id
 * @param {number} userId - User id
 * @param {Object} updateBody - Update body object
 * @returns {Promise<SavedContract & { isDefault: boolean; nickname: string }>}
 */
const updateSavedContractById = async (
  id: string,
  userId: string,
  updateBody: { nickname: string }
): Promise<SavedContract & { isDefault: boolean; nickname: string }> => {
  id = validateAndSanitizeContractId(id);
  const savedContract = await getSavedContractById(id, userId);
  if (!savedContract) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Saved contract not found');
  }

  const updatedUserSavedContract = await prisma.userSavedContract.update({
    where: {
      userId_contractId: {
        userId,
        contractId: id
      }
    },
    data: {
      nickname: updateBody.nickname
    },
    include: {
      contract: true
    }
  });

  return {
    ...updatedUserSavedContract.contract,
    isDefault: updatedUserSavedContract.isDefault,
    nickname: updatedUserSavedContract.nickname
  };
};

/**
 * Delete saved contract by id
 * @param {string} id - Saved contract id
 * @param {number} userId - User id
 * @returns {Promise<void>}
 */
const deleteSavedContractById = async (id: string, userId: string): Promise<void> => {
  id = validateAndSanitizeContractId(id);
  await prisma.$transaction(async (tx) => {
    const savedContract = await tx.userSavedContract.findUnique({
      where: {
        userId_contractId: {
          userId,
          contractId: id
        }
      }
    });

    if (!savedContract) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Saved contract not found');
    }

    await tx.userSavedContract.delete({
      where: {
        userId_contractId: {
          userId,
          contractId: id
        }
      }
    });

    if (savedContract.isDefault) {
      // Find another contract to set as default
      const anotherContract = await tx.userSavedContract.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (anotherContract) {
        await tx.userSavedContract.update({
          where: {
            userId_contractId: {
              userId,
              contractId: anotherContract.contractId
            }
          },
          data: { isDefault: true }
        });
      }
    }
  });
};

/**
 * Set default contract for a user
 * @param {string} id - Saved contract id
 * @param {number} userId - User id
 * @returns {Promise<void>}
 */
const setDefaultContract = async (userId: string, contractId: string): Promise<void> => {
  contractId = validateAndSanitizeContractId(contractId);
  await prisma.$transaction(async (tx) => {
    const savedContract = await tx.userSavedContract.findUnique({
      where: { userId_contractId: { userId, contractId } }
    });

    if (!savedContract) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Saved contract not found');
    }

    // Unset any existing default contract
    await tx.userSavedContract.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    // Set the new default contract
    const updatedContract = await tx.userSavedContract.update({
      where: { userId_contractId: { userId, contractId } },
      data: { isDefault: true }
    });

    if (!updatedContract) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Failed to set default contract');
    }
  });
};

/**
 * Get contract nickname by contract id
 * @param {string} contractId - Contract id
 * @param {number} userId - User id
 * @returns {Promise<string | null>} - Contract nickname or null if not found
 */
const getContractNickname = async (contractId: string, userId: string): Promise<string | null> => {
  contractId = validateAndSanitizeContractId(contractId);
  const userSavedContract = await prisma.userSavedContract.findUnique({
    where: {
      userId_contractId: {
        userId,
        contractId
      }
    }
  });

  return userSavedContract ? userSavedContract.nickname : null;
};

/**
 * Fetch all saved contracts with associated user data
 * @returns {Promise<Array<SavedContract & { users: Array<{ userId: string, nickname: string }> }>>}
 */
const getAllSavedContractsWithUsers = async (): Promise<
  Array<SavedContract & { users: Array<{ userId: string; nickname: string }> }>
> => {
  try {
    const savedContracts = await prisma.savedContract.findMany({
      include: {
        users: {
          select: {
            userId: true,
            nickname: true
          }
        }
      }
    });

    return savedContracts;
  } catch (error) {
    logger.error('Error in getAllSavedContractsWithUsers:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while fetching saved contracts'
    );
  }
};

export default {
  createSavedContract,
  querySavedContracts,
  getSavedContractById,
  updateSavedContractById,
  deleteSavedContractById,
  setDefaultContract,
  getContractNickname,
  getAllSavedContractsWithUsers
};
