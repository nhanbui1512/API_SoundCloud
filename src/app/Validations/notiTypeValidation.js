const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const { response } = require('express');

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

const deleteNotiTypeValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      id: Joi.number().integer().min(1).required(),
    });

    await condition.validateAsync(req.params, { abortEarly: false });
    return next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

module.exports = {
  notiTypeValidation,
  deleteNotiTypeValidation,
};
