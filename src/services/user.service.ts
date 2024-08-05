import { clerkClient, User } from '@clerk/clerk-sdk-node';

/**
 * Fetches a user by their ID using the Clerk API.
 *
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<User>} A promise that resolves to the user object from Clerk.
 * @throws Will throw an error if the user cannot be found or if there's an issue with the Clerk API.
 */
const getUserById = async (userId: string): Promise<User> => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch user with ID ${userId}: ${errorMessage}`);
  }
};

/**
 * Updates a user's information using the Clerk API.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<User>} updateData - The data to update for the user.
 * @returns {Promise<User>} A promise that resolves to the updated user object from Clerk.
 * @throws Will throw an error if the user cannot be updated or if there's an issue with the Clerk API.
 */
const updateUser = async (userId: string, updateData: Partial<User>): Promise<User> => {
  try {
    const updatedUser = await clerkClient.users.updateUser(userId, updateData as any);
    return updatedUser;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to update user with ID ${userId}: ${errorMessage}`);
  }
};

export default {
  getUserById,
  updateUser
};
