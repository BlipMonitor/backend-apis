import Joi from 'joi';

/**
 * Custom validation for Soroban contract ID
 */
const sorobanContractId = Joi.string()
  .regex(/^C[A-Z0-9]{55}$/)
  .required();

/**
 * Validation schema for creating a saved contract
 */
const createSavedContract = {
  body: Joi.object().keys({
    contractId: sorobanContractId,
    nickname: Joi.string().optional()
  })
};

/**
 * Validation schema for getting saved contracts
 */
const getSavedContracts = {
  query: Joi.object().keys({
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional()
  })
};

/**
 * Validation schema for getting a single saved contract
 */
const getSavedContract = {
  params: Joi.object().keys({
    id: sorobanContractId
  })
};

/**
 * Validation schema for updating a saved contract
 */
const updateSavedContract = {
  params: Joi.object().keys({
    id: sorobanContractId
  }),
  body: Joi.object()
    .keys({
      nickname: Joi.string().required()
    })
    .min(1)
};

/**
 * Validation schema for deleting a saved contract
 */
const deleteSavedContract = {
  params: Joi.object().keys({
    id: sorobanContractId
  })
};

/**
 * Validation schema for setting a default contract
 */
const setDefaultContract = {
  params: Joi.object().keys({
    id: sorobanContractId
  })
};

export default {
  createSavedContract,
  getSavedContracts,
  getSavedContract,
  updateSavedContract,
  deleteSavedContract,
  setDefaultContract
};
