import Joi from 'joi';

/**
 * Validation schema for updating the current user's information
 */
const updateMe = {
  body: Joi.object()
    .keys({
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
      username: Joi.string().min(3).max(30).optional(),
      email: Joi.string().email().optional()
    })
    .min(1) // Ensure at least one field is provided
};

export default {
  updateMe
};
