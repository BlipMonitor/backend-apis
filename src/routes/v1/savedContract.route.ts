import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import express from 'express';

import { savedContractController } from '../../controllers';
import validate from '../../middlewares/validate';
import { savedContractValidation } from '../../validations';

const router = express.Router();

router
  .route('/')
  .post(
    ClerkExpressRequireAuth(),
    validate(savedContractValidation.createSavedContract),
    savedContractController.createSavedContract
  )
  .get(
    ClerkExpressRequireAuth(),
    validate(savedContractValidation.getSavedContracts),
    savedContractController.getSavedContracts
  );

router
  .route('/:id')
  .get(
    ClerkExpressRequireAuth(),
    validate(savedContractValidation.getSavedContract),
    savedContractController.getSavedContract
  )
  .patch(
    ClerkExpressRequireAuth(),
    validate(savedContractValidation.updateSavedContract),
    savedContractController.updateSavedContract
  )
  .delete(
    ClerkExpressRequireAuth(),
    validate(savedContractValidation.deleteSavedContract),
    savedContractController.deleteSavedContract
  );

router
  .route('/:id/set-default')
  .post(
    ClerkExpressRequireAuth(),
    validate(savedContractValidation.setDefaultContract),
    savedContractController.setDefaultContract
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: SavedContracts
 *   description: Saved contract management and retrieval
 */

/**
 * @swagger
 * /saved-contracts:
 *   post:
 *     summary: Create a saved contract
 *     description: Create a new saved contract for the authenticated user.
 *     tags: [SavedContracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractId
 *             properties:
 *               contractId:
 *                 type: string
 *               nickname:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SavedContract'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all saved contracts
 *     description: Retrieve all saved contracts for the authenticated user.
 *     tags: [SavedContracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of saved contracts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavedContract'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /saved-contracts/{id}:
 *   get:
 *     summary: Get a saved contract
 *     description: Retrieve a specific saved contract by ID for the authenticated user.
 *     tags: [SavedContracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved contract id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SavedContract'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a saved contract
 *     description: Update a specific saved contract by ID for the authenticated user.
 *     tags: [SavedContracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved contract id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SavedContract'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a saved contract
 *     description: Delete a specific saved contract by ID for the authenticated user.
 *     tags: [SavedContracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved contract id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /saved-contracts/{id}/set-default:
 *   post:
 *     summary: Set a saved contract as default
 *     description: Set a specific saved contract as the default contract for the authenticated user.
 *     tags: [SavedContracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved contract id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Default contract set successfully
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
