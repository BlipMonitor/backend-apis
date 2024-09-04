import { DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';

/**
 * Parses and validates the limit parameter from the request query
 * @param limitParam - The limit parameter from the request query
 * @returns A validated limit number
 */
export const parseLimit = (limitParam: unknown): number => {
  let parsedLimit: number;

  if (typeof limitParam === 'string') {
    parsedLimit = parseInt(limitParam, 10);
  } else if (typeof limitParam === 'number') {
    parsedLimit = limitParam;
  } else {
    parsedLimit = NaN;
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsedLimit, MAX_LIMIT);
};
