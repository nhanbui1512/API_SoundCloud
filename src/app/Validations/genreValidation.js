const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

const genreValidation = async (req, response, next) => {
  const condition = Joi.object({
    name: Joi.string().required().min(2).max(15).trim().strict(),
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

const getSongsValidation = async (req, response, next) => {
  const condition = Joi.object({
    id: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    per_page: Joi.number().integer().required(),
  });

  try {
    await condition.validateAsync(req.query);
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

const deleteGenreValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      id: Joi.number().integer().required(),
    });
    await condition.validateAsync(req.params);
    return next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};
module.exports = {
  genreValidation,
  getSongsValidation,
  deleteGenreValidation,
};
