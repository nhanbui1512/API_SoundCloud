const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

const createCommentValidation = async (req, res, next) => {
  const condition = Joi.object({
    songId: Joi.number().integer().required().min(1),
    commentId: Joi.number().integer().min(1),
  });

  try {
    await condition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};
module.exports = {
  createCommentValidation,
};
