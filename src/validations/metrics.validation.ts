import Joi from 'joi';

import { DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';
import { TimeRange } from '../types/timeRange';

/**
 * Custom validation for Soroban contract ID
 */
const sorobanContractId = Joi.string().regex(/^C[A-Z0-9]{55}$/);

/**
 * Base schema for all metrics validations
 */
const baseSchema = {
  query: Joi.object().keys({
    timeRange: Joi.string()
      .valid(...Object.values(TimeRange))
      .default(TimeRange.WEEK_1)
  })
};

/**
 * Validation for getting transaction volume
 */
const getTxVolume = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

/**
 * Validation for getting transaction success rate
 */
const getTxSuccessRate = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

/**
 * Validation for getting unique users
 */
const getUniqueUsers = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

/**
 * Validation for getting transaction fees
 */
const getTxFees = {
  ...baseSchema,
  params: Joi.object().keys({
    contractId: sorobanContractId
  })
};

/**
 * Validation for getting top events
 */
const getTopEvents = {
  params: Joi.object().keys({
    contractId: sorobanContractId
  }),
  query: Joi.object().keys({
    timeRange: Joi.string()
      .valid(...Object.values(TimeRange))
      .default(TimeRange.WEEK_1),
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).optional()
  })
};

/**
 * Validation for getting top users
 */
const getTopUsers = {
  params: Joi.object().keys({
    contractId: sorobanContractId
  }),
  query: Joi.object().keys({
    timeRange: Joi.string()
      .valid(...Object.values(TimeRange))
      .default(TimeRange.WEEK_1),
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).optional()
  })
};

export default {
  getTxVolume,
  getTxSuccessRate,
  getUniqueUsers,
  getTxFees,
  getTopEvents,
  getTopUsers
};
