require('dotenv').config();
const jwt = require('jsonwebtoken');
const token_require = require('../until/token');

const { StatusCodes } = require('http-status-codes');
const { UserModel } = require('../models');
const AuthorizeError = require('../errors/AuthorizeError');
const NotFoundError = require('../errors/NotFoundError');

class AuthController {
  async refreshToken(req, response, next) {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken)
      return response
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ message: 'Not found refreshToken' });

    try {
      var decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const userId = decode.userId;
      const user = await UserModel.findByPk(userId);
      if (user === null) throw NotFoundError({ message: 'Not found user' });

      // if user logout
      if (user.refreshToken !== refreshToken)
        return response.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden error' });

      // generate new accessToken
      const newAccessToken = token_require.GenerateAcessToken(user);
      return response.status(200).json({ status: 'success', accessToken: newAccessToken });
    } catch (error) {
      throw new AuthorizeError({ authorize: 'Accesstoken not validation' });
    }
  }
}

module.exports = new AuthController();
