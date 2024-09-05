import httpStatus from 'http-status';
import Joi from 'joi';

import ApiError from './ApiError';

const sorobanContractIdSchema = Joi.string()
  .regex(/^C[A-Z0-9]{55}$/)
  .required();

/**
 * Validates and sanitizes a Soroban contract ID.
 * @param contractId - The contract ID to validate and sanitize.
 * @returns The sanitized contract ID.
 */
export const validateAndSanitizeContractId = (contractId: string): string => {
  const { error, value } = sorobanContractIdSchema.validate(contractId.trim().toUpperCase());
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Soroban contract ID');
  }
  return value;
};
