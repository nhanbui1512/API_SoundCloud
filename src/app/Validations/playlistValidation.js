const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

const updateValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      name: Joi.string().min(3).max(100).trim().required(),
      playlistId: Joi.number().integer().min(1).required(),
    });
    await condition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

const getPlaylist = async (req, response, next) => {
  try {
    const condition = Joi.object({
      page: Joi.number().integer().min(1),
      per_page: Joi.number().integer().min(1).max(100),
    });
    await condition.validateAsync(req.query, { abortEarly: false });
    return next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

const getPlaylistByUserId = async (req, response, next) => {
  try {
    const condition = Joi.object({
      idUser: Joi.number().integer().min(1).required(),
    });
    await condition.validateAsync(req.query);
    return next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errros: error.message });
  }
};

module.exports = {
  updateValidation,
  getPlaylist,
  getPlaylistByUserId,
};
