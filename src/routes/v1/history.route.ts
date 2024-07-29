import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import express from 'express';

import { historyController } from '../../controllers';
import validate from '../../middlewares/validate';
import { historyValidation } from '../../validations';

const router = express.Router();

// Routes for all saved contracts
router
  .route('/recent-tx')
  .get(
    ClerkExpressRequireAuth(),
    validate(historyValidation.getRecentTx),
    historyController.getAllContractsRecentTx
  );

router
  .route('/recent-events')
  .get(
    ClerkExpressRequireAuth(),
    validate(historyValidation.getRecentEvents),
    historyController.getAllContractsRecentEvents
  );

router
  .route('/recent-alerts')
  .get(
    ClerkExpressRequireAuth(),
    validate(historyValidation.getRecentAlerts),
    historyController.getAllContractsRecentAlerts
  );

// Routes for a single contract
router
  .route('/recent-tx/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(historyValidation.getRecentTx),
    historyController.getContractRecentTx
  );

router
  .route('/recent-events/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(historyValidation.getRecentEvents),
    historyController.getContractRecentEvents
  );

router
  .route('/recent-alerts/:contractId')
  .get(
    ClerkExpressRequireAuth(),
    validate(historyValidation.getRecentAlerts),
    historyController.getContractRecentAlerts
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: History
 *   description: Soroban contract transaction and event history retrieval
 */

/**
 * @swagger
 * /history/recent-tx:
 *   get:
 *     summary: Get recent transactions for all saved Soroban contracts
 *     description: Retrieve recent transaction data for all saved Soroban contracts.
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of recent transactions to return per contract
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contracts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contractId:
 *                         type: string
 *                       recentTransactions:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/RecentTransaction'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /history/recent-events:
 *   get:
 *     summary: Get recent events for all saved Soroban contracts
 *     description: Retrieve recent event data for all saved Soroban contracts.
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of recent events to return per contract
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contracts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contractId:
 *                         type: string
 *                       recentEvents:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/RecentEvent'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /history/recent-tx/{contractId}:
 *   get:
 *     summary: Get recent transactions for a specific Soroban contract
 *     description: Retrieve recent transaction data for a specific Soroban contract.
 *     tags: [History]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of recent transactions to return
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecentTransaction'
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
 * /history/recent-events/{contractId}:
 *   get:
 *     summary: Get recent events for a specific Soroban contract
 *     description: Retrieve recent event data for a specific Soroban contract.
 *     tags: [History]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of recent events to return
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecentEvent'
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
 * /history/recent-alerts:
 *   get:
 *     summary: Get recent alerts for all saved Soroban contracts
 *     description: Retrieve recent alert data for all saved Soroban contracts.
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of recent alerts to return
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecentAlert'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /history/recent-alerts/{contractId}:
 *   get:
 *     summary: Get recent alerts for a specific Soroban contract
 *     description: Retrieve recent alert data for a specific Soroban contract.
 *     tags: [History]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of recent alerts to return
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecentAlert'
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
 *     RecentTransaction:
 *       type: object
 *       properties:
 *         contractId:
 *           type: string
 *           description: The ID of the Soroban contract
 *         sourceAccount:
 *           type: string
 *           description: The account that initiated the transaction
 *         transactionHash:
 *           type: string
 *           description: The unique hash of the transaction
 *         ledgerSequence:
 *           type: integer
 *           description: The sequence number of the ledger in which this transaction was included
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the transaction was created
 *         functionName:
 *           type: string
 *           description: The name of the function called in the contract
 *         parameters:
 *           type: string
 *           description: The parameters passed to the function call (JSON string)
 *         successful:
 *           type: boolean
 *           description: Indicates whether the transaction was successful or not
 *         feeCharged:
 *           type: number
 *           description: The fee charged for the transaction
 *     RecentEvent:
 *       type: object
 *       properties:
 *         contractId:
 *           type: string
 *           description: The ID of the Soroban contract
 *         transactionHash:
 *           type: string
 *           description: The unique hash of the transaction that emitted this event
 *         ledgerSequence:
 *           type: integer
 *           description: The sequence number of the ledger in which this event was emitted
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the event was emitted
 *         eventType:
 *           type: string
 *           description: The type of the event
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           description: The topics associated with the event
 *         data:
 *           type: object
 *           description: The data associated with the event
 *         successful:
 *           type: boolean
 *           description: Indicates whether the event was emitted in a successful transaction
 *         inSuccessfulContractCall:
 *           type: boolean
 *           description: Indicates whether the event was emitted in a successful contract call
 *     RecentAlert:
 *       type: object
 *       properties:
 *         alertTime:
 *           type: string
 *           description: The timestamp when the alert was triggered
 *         totalTransactions:
 *           type: integer
 *           description: The total number of transactions in the alert interval
 *         failedTransactions:
 *           type: integer
 *           description: The number of failed transactions in the alert interval
 *         errorRate:
 *           type: number
 *           description: The error rate (failed transactions / total transactions) in the alert interval
 */
