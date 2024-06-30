const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

class Validation {
  get = async (req, response, next) => {
    const condition = Joi.object({
      song_id: Joi.number().integer().min(0).required(),
      page: Joi.number().integer().min(1),
      per_page: Joi.number().integer().min(1).max(50),
    });

    try {
      await condition.validateAsync(req.query, { abortEarly: false });
      next();
    } catch (error) {
      return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  };
  create = async (req, res, next) => {
    const condition = Joi.object({
      song_id: Joi.number().integer().required().min(1),
      comment_id: Joi.number().integer().min(1),
      content: Joi.string().min(0).max(500).required(),
    });

    try {
      await condition.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  };
  delete = async (req, res, next) => {
    const condition = Joi.object({
      comment_id: Joi.number().integer().required().min(1),
    });
    try {
      await condition.validateAsync(req.query);
      next();
    } catch (error) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  };
}
module.exports = new Validation();
