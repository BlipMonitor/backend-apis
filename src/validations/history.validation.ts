import Joi from 'joi';

import { DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';

/**
 * Custom validation for Soroban contract ID
 */
const sorobanContractId = Joi.string().regex(/^C[A-Z0-9]{55}$/);

/**
 * Base schema for all history validations
 */
const baseSchema = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT)
  })
};

/**
 * Validation for getting recent transactions
 */
const getRecentTx = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

/**
 * Validation for getting recent events
 */
const getRecentEvents = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

/**
 * Validation for getting recent alerts
 */
const getRecentAlerts = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

export default {
  getRecentTx,
  getRecentEvents,
  getRecentAlerts
};
