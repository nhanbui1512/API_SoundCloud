const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

class followValidation {
  async getFollowers(req, response, next) {
    try {
      const condition = Joi.object({
        idUser: Joi.number().integer().min(1).required(),
      });
      await condition.validateAsync(req.query);
      return next();
    } catch (error) {
      return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  }

  async followPlaylist(req, response, next) {
    try {
      const condition = Joi.object({
        idPlaylist: Joi.number().integer().min(1).required(),
      });
      await condition.validateAsync(req.query);
      return next();
    } catch (error) {
      return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  }

  async unFollowPlaylist(req, response, next) {
    try {
      const condition = Joi.object({
        idPlaylist: Joi.number().integer().min(1).required(),
      });
      await condition.validateAsync(req.query);
      return next();
    } catch (error) {
      return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  }

  async unFollowUser(req, response, next) {
    try {
      const condition = Joi.object({
        user_id: Joi.number().integer().min(1).required(),
      });
      await condition.validateAsync(req.query);
      return next();
    } catch (error) {
      return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  }

  async followUser(req, response, next) {
    try {
      const condition = Joi.object({
        user_id: Joi.number().integer().min(1).required(),
      });
      await condition.validateAsync(req.query);
      return next();
    } catch (error) {
      return response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.message });
    }
  }
}

module.exports = new followValidation();
