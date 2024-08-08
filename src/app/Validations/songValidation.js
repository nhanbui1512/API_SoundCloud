const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

const createSongValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      description: Joi.string().required().min(10).max(200).trim().strict(),
      genreId: Joi.number().integer().required(),
      name: Joi.string().min(5).max(50).required(),
      artistName: Joi.string().required(),
    });

    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

const songsLikedValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      user_id: Joi.number().integer().min(1),
    });
    await condition.validateAsync(req.query);
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};

module.exports = {
  createSongValidation,
  songsLikedValidation,
};
