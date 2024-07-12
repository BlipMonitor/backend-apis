import { RequireAuthProp } from '@clerk/clerk-sdk-node';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import logger from '../config/logger';
import { userService } from '../services';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';

/**
 * Retrieves the current user's information.
 * This controller function is designed to be used with the /me endpoint.
 * It fetches detailed user information using the Clerk API.
 *
 * @route GET /api/v1/users/me
 * @param {RequireAuthProp<Request>} req - The Express request object, enhanced with Clerk authentication.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getMe = catchAsync(async (req: RequireAuthProp<Request>, res: Response): Promise<void> => {
  const userId = req.auth.userId;
  logger.info(`Fetching detailed user information for user ${userId}`);

  const user = await userService.getUserById(userId);

  res.status(httpStatus.OK).send({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    username: user.username,
    email: user.emailAddresses[0].emailAddress,
    profileImageUrl: user.imageUrl
  });
});

/**
 * Updates the current user's information.
 * This controller function is designed to be used with the /me endpoint.
 * It updates user information using the Clerk API.
 *
 * @route PATCH /api/v1/users/me
 * @param {RequireAuthProp<Request>} req - The Express request object, enhanced with Clerk authentication.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateMe = catchAsync(async (req: RequireAuthProp<Request>, res: Response): Promise<void> => {
  const userId = req.auth.userId;
  logger.info(`Updating user information for user ${userId}`);

  const updateData = req.body;
  const updatedUser = await userService.updateUser(userId, updateData);

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.status(httpStatus.OK).send({
    id: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    fullName: updatedUser.fullName,
    username: updatedUser.username,
    email: updatedUser.emailAddresses[0].emailAddress,
    profileImageUrl: updatedUser.imageUrl
  });
});

export default {
  getMe,
  updateMe
};
