const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');

const registerValidation = async (req, response, next) => {
  const correctCondition = Joi.object({
    userName: Joi.string().required().min(3).max(50).trim().strict(),
    email: Joi.string().required().min(3).max(50).trim().strict(),
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  });

  await correctCondition.validateAsync(req.body, { abortEarly: false });
  next();
  try {
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: error.message,
    });
  }
};

module.exports = {
  registerValidation,
};
