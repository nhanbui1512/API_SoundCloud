const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');

const loginValidation = async (req, response, next) => {
  const condition = Joi.object({
    email: Joi.string().required().min(3).max(50).trim().strict(),
    password: Joi.string().required().min(3).max(50).trim().strict(),
  });

  await condition.validateAsync(req.body, { abortEarly: false });
  next();

  try {
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

module.exports = {
  loginValidation,
};
