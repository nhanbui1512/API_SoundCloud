const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');

const notiTypeValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      name: Joi.string().min(4).max(20).required().trim().strict(),
    });
    await condition.validateAsync(req.body, { abortEarly: false });
    return next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

module.exports = {
  notiTypeValidation,
};
