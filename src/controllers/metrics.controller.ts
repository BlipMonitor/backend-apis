import { RequireAuthProp } from '@clerk/clerk-sdk-node';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import logger from '../config/logger';
import { metricsService, savedContractService } from '../services';
import { TimeRange } from '../types/timeRange';
import catchAsync from '../utils/catchAsync';
import { parseLimit } from '../utils/requestParsers';

/**
 * Type alias for the keys of the metricsService object.
 * This ensures type safety when accessing metrics functions.
 */
type MetricType = keyof typeof metricsService;

/**
 * Higher-order function that creates a controller for fetching metrics for a single contract.
 * @param {MetricType} metricType - The type of metric to fetch (e.g., 'getTxVolume', 'getTxSuccessRate').
 * @returns {Function} An async function that handles the request and sends the response.
 */
const getMetrics = (metricType: MetricType) =>
  catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
    // Extract necessary data from the request
    const { contractId } = req.params;
    const timeRange = (req.query.timeRange as TimeRange) || TimeRange.WEEK_1;
    const userId = req.auth.userId;

    // Log the metric request
    logger.info(`Requesting ${metricType} for contract ${contractId} over ${timeRange}`);

    let data;
    if (metricType === 'getTopEvents' || metricType === 'getTopUsers') {
      const limit = parseLimit(req.query.limit);
      data = await metricsService[metricType]([contractId], timeRange, userId, limit);
    } else {
      data = await metricsService[metricType]([contractId], timeRange, userId);
    }

    // Send the response
    res.status(httpStatus.OK).send(data);
  });

/**
 * Higher-order function that creates a controller for fetching metrics for all contracts of a user.
 * @param {MetricType} metricType - The type of metric to fetch (e.g., 'getTxVolume', 'getTxSuccessRate').
 * @returns {Function} An async function that handles the request and sends the response.
 */
const getAllMetrics = (metricType: MetricType) =>
  catchAsync(async (req: RequireAuthProp<Request>, res: Response) => {
    // Extract necessary data from the request
    const { userId } = req.auth;
    const timeRange = (req.query.timeRange as TimeRange) || TimeRange.WEEK_1;

    // Fetch all saved contracts for the user
    const savedContracts = await savedContractService.querySavedContracts({ userId }, {});
    const contractIds = savedContracts.results.map(({ contractId }) => contractId);

    // Log the metric request
    logger.info(`Requesting ${metricType} for all contracts of user ${userId} over ${timeRange}`);

    let data;
    if (metricType === 'getTopEvents' || metricType === 'getTopUsers') {
      const limit = parseLimit(req.query.limit);
      data = await metricsService[metricType](contractIds, timeRange, userId, limit);
    } else {
      data = await metricsService[metricType](contractIds, timeRange, userId);
    }

    // Send the response
    res.status(httpStatus.OK).send(data);
  });

// Export an object with all the metric controller functions
export default {
  getContractTxVolume: getMetrics('getTxVolume'),
  getAllContractsTxVolume: getAllMetrics('getTxVolume'),
  getContractTxSuccessRate: getMetrics('getTxSuccessRate'),
  getAllContractsTxSuccessRate: getAllMetrics('getTxSuccessRate'),
  getContractUniqueUsers: getMetrics('getUniqueUsers'),
  getAllContractsUniqueUsers: getAllMetrics('getUniqueUsers'),
  getContractTxFees: getMetrics('getTxFees'),
  getAllContractsTxFees: getAllMetrics('getTxFees'),
  getContractTopEvents: getMetrics('getTopEvents'),
  getAllContractsTopEvents: getAllMetrics('getTopEvents'),
  getContractTopUsers: getMetrics('getTopUsers'),
  getAllContractsTopUsers: getAllMetrics('getTopUsers')
};
