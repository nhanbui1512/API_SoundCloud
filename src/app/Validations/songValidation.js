const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

//#region createSong
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
//#endregion

//#region song liked
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
//#endregion

//#region get songs
const getSongsValidation = async (req, response, next) => {
  const condition = Joi.object({
    page: Joi.number().integer().min(1),
    per_page: Joi.number().integer().min(1).max(100),
    sort: Joi.string().min(3).max(20).trim(),
    search: Joi.string().min(1).max(100),
    suffle: Joi.boolean(),
  });
  try {
    await condition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};
//#endregion

//#region  like song
const likeSongValidation = async (req, response, next) => {
  const condition = Joi.object({
    song_id: Joi.number().integer().min(1).required(),
  });
  await condition.validateAsync(req.query);
  next();
  try {
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};
//#endregion

//#region  search
const searchValidation = async (req, response, next) => {
  try {
    const condition = Joi.object({
      page: Joi.number().integer().min(1),
      per_page: Joi.number().integer().min(5).max(100),
      search_value: Joi.string().trim().required(),
      sort: Joi.string().trim().max(100),
    });
    await condition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
  }
};
//#endregion

module.exports = {
  createSongValidation,
  songsLikedValidation,
  getSongsValidation,
  likeSongValidation,
  searchValidation,
};
