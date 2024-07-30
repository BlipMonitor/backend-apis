import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import express from 'express';

import { metricsController } from '../../controllers';
import validate from '../../middlewares/validate';
import { metricsValidation } from '../../validations';

const router = express.Router();

// Routes for all saved contracts
router
  .route('/tx-volume')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTxVolume),
    metricsController.getAllContractsTxVolume
  );

router
  .route('/tx-success-rate')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTxSuccessRate),
    metricsController.getAllContractsTxSuccessRate
  );

router
  .route('/unique-users')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getUniqueUsers),
    metricsController.getAllContractsUniqueUsers
  );

router
  .route('/tx-fees')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTxFees),
    metricsController.getAllContractsTxFees
  );

router
  .route('/top-events')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTopEvents),
    metricsController.getAllContractsTopEvents
  );

router
  .route('/top-users')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTopUsers),
    metricsController.getAllContractsTopUsers
  );

// Routes for a single contract
router
  .route('/tx-volume/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTxVolume),
    metricsController.getContractTxVolume
  );

router
  .route('/tx-success-rate/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTxSuccessRate),
    metricsController.getContractTxSuccessRate
  );

router
  .route('/unique-users/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getUniqueUsers),
    metricsController.getContractUniqueUsers
  );

router
  .route('/tx-fees/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTxFees),
    metricsController.getContractTxFees
  );

router
  .route('/top-events/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTopEvents),
    metricsController.getContractTopEvents
  );

router
  .route('/top-users/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(metricsValidation.getTopUsers),
    metricsController.getContractTopUsers
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Soroban contract metrics retrieval
 */

/**
 * @swagger
 * /metrics/tx-volume:
 *   get:
 *     summary: Get transaction volume for all Soroban contracts
 *     description: Retrieve transaction volume data for all Soroban contracts over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the transaction volume data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalTransactionVolume:
 *                   $ref: '#/components/schemas/IntervalTransactionVolume'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/tx-volume/{contractId}:
 *   get:
 *     summary: Get transaction volume for a specific Soroban contract
 *     description: Retrieve transaction volume data for a specific Soroban contract over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Soroban contract ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the transaction volume data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalTransactionVolume:
 *                   $ref: '#/components/schemas/IntervalTransactionVolume'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/tx-success-rate:
 *   get:
 *     summary: Get transaction success rate for all Soroban contracts
 *     description: Retrieve transaction success rate data for all Soroban contracts over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the transaction success rate data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalTransactionSuccessRate:
 *                   $ref: '#/components/schemas/IntervalTransactionSuccessRate'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/tx-success-rate/{contractId}:
 *   get:
 *     summary: Get transaction success rate for a specific Soroban contract
 *     description: Retrieve transaction success rate data for a specific Soroban contract over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Soroban contract ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the transaction success rate data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalTransactionSuccessRate:
 *                   $ref: '#/components/schemas/IntervalTransactionSuccessRate'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/unique-users:
 *   get:
 *     summary: Get unique users for all Soroban contracts
 *     description: Retrieve unique users data for all Soroban contracts over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the unique users data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalUniqueUsers:
 *                   $ref: '#/components/schemas/IntervalUniqueUsers'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/unique-users/{contractId}:
 *   get:
 *     summary: Get unique users for a specific Soroban contract
 *     description: Retrieve unique users data for a specific Soroban contract over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Soroban contract ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the unique users data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalUniqueUsers:
 *                   $ref: '#/components/schemas/IntervalUniqueUsers'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/tx-fees:
 *   get:
 *     summary: Get transaction fees for all Soroban contracts
 *     description: Retrieve transaction fees data for all Soroban contracts over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the transaction fees data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalTransactionFees:
 *                   $ref: '#/components/schemas/IntervalTransactionFees'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/tx-fees/{contractId}:
 *   get:
 *     summary: Get transaction fees for a specific Soroban contract
 *     description: Retrieve transaction fees data for a specific Soroban contract over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Soroban contract ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the transaction fees data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intervalTransactionFees:
 *                   $ref: '#/components/schemas/IntervalTransactionFees'
 *                 compared:
 *                   $ref: '#/components/schemas/ComparedMetric'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/top-events:
 *   get:
 *     summary: Get top events for all Soroban contracts
 *     description: Retrieve top events data for all Soroban contracts over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the top events data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of top events returned
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopEvent'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/top-events/{contractId}:
 *   get:
 *     summary: Get top events for a specific Soroban contract
 *     description: Retrieve top events data for a specific Soroban contract over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Soroban contract ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the top events data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of top events returned
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopEvent'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/top-users:
 *   get:
 *     summary: Get top users for all Soroban contracts
 *     description: Retrieve top users data for all Soroban contracts over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the top users data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of top users returned
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopUser'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /metrics/top-users/{contractId}:
 *   get:
 *     summary: Get top users for a specific Soroban contract
 *     description: Retrieve top users data for a specific Soroban contract over a given time range.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Soroban contract ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [HOUR_1, HOUR_3, HOUR_6, HOUR_12, DAY_1, WEEK_1, WEEK_2, MONTH_1, MONTH_3, MONTH_6, YEAR_1]
 *         default: WEEK_1
 *         description: Time range for the top users data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of top users returned
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopUser'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IntervalTransactionVolume:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         transactionCount:
 *           type: integer
 *           description: Number of transactions for the interval
 *     IntervalTransactionSuccessRate:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         transactionCount:
 *           type: integer
 *           description: Total number of transactions for the interval
 *         successfulTransactions:
 *           type: integer
 *           description: Number of successful transactions for the interval
 *         failedTransactions:
 *           type: integer
 *           description: Number of failed transactions for the interval
 *         intervalSuccessRate:
 *           type: number
 *           description: Success rate for the interval (percentage)
 *         intervalFailureRate:
 *           type: number
 *           description: Failure rate for the interval (percentage)
 *     IntervalTransactionFees:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         totalFees:
 *           type: number
 *           description: Total fees for the interval
 *         avgFee:
 *           type: number
 *           description: Average fee for the interval
 *         transactionCount:
 *           type: integer
 *           description: Number of transactions for the interval
 *     IntervalUniqueUsers:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         uniqueUsers:
 *           type: integer
 *           description: Number of unique users for the interval
 *     ComparedMetric:
 *       type: object
 *       properties:
 *         previousCount:
 *           type: integer
 *           nullable: true
 *         absoluteChange:
 *           type: integer
 *         percentageChange:
 *           type: number
 *           nullable: true
 *     TopEvent:
 *       type: object
 *       properties:
 *         contractId:
 *           type: string
 *         contractNickname:
 *           type: string
 *         eventName:
 *           type: string
 *         eventCount:
 *           type: integer
 *         compared:
 *           $ref: '#/components/schemas/ComparedMetric'
 *     TopUser:
 *       type: object
 *       properties:
 *         contractId:
 *           type: string
 *         contractNickname:
 *           type: string
 *         user:
 *           type: string
 *         transactionCount:
 *           type: integer
 *         compared:
 *           $ref: '#/components/schemas/ComparedMetric'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IntervalTransactionVolume:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         transactionCount:
 *           type: integer
 *           description: Number of transactions for the interval
 *     IntervalTransactionSuccessRate:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         transactionCount:
 *           type: integer
 *           description: Total number of transactions for the interval
 *         successfulTransactions:
 *           type: integer
 *           description: Number of successful transactions for the interval
 *         failedTransactions:
 *           type: integer
 *           description: Number of failed transactions for the interval
 *         intervalSuccessRate:
 *           type: number
 *           description: Success rate for the interval (percentage)
 *         intervalFailureRate:
 *           type: number
 *           description: Failure rate for the interval (percentage)
 *     IntervalTransactionFees:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         totalFees:
 *           type: number
 *           description: Total fees for the interval
 *         avgFee:
 *           type: number
 *           description: Average fee for the interval
 *         transactionCount:
 *           type: integer
 *           description: Number of transactions for the interval
 *     IntervalUniqueUsers:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date for the interval
 *         uniqueUsers:
 *           type: integer
 *           description: Number of unique users for the interval
 *     ComparedMetric:
 *       type: object
 *       properties:
 *         previousCount:
 *           type: integer
 *           nullable: true
 *         absoluteChange:
 *           type: integer
 *         percentageChange:
 *           type: number
 *           nullable: true
 *     TopEvent:
 *       type: object
 *       properties:
 *         contractId:
 *           type: string
 *         contractNickname:
 *           type: string
 *         eventName:
 *           type: string
 *         eventCount:
 *           type: integer
 *         compared:
 *           $ref: '#/components/schemas/ComparedMetric'
 *     TopUser:
 *       type: object
 *       properties:
 *         contractId:
 *           type: string
 *         contractNickname:
 *           type: string
 *         user:
 *           type: string
 *         transactionCount:
 *           type: integer
 *         compared:
 *           $ref: '#/components/schemas/ComparedMetric'
 */
