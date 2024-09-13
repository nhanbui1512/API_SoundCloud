require('dotenv').config();
const jwt = require('jsonwebtoken');
const token_require = require('../until/token');

const { StatusCodes } = require('http-status-codes');
const { UserModel, AuthProviderModel } = require('../models');
const AuthorizeError = require('../errors/AuthorizeError');
const NotFoundError = require('../errors/NotFoundError');

const axios = require('axios');
const userRepository = require('../Repositories/userRepository');

// const mailService = require('../services/mailService');

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
      throw new AuthorizeError({ authorize: 'Refreshtoken not validation' });
    }
  }
  async loginWithGoogle(req, response) {
    try {
      const { token } = req.body;
      const res = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const { email, name, picture } = res.data;
      const isExisted = await UserModel.findOne({
        where: {
          email: email,
        },
      });
      if (isExisted === null) {
        // create account
        const newUser = await userRepository.create({
          email: email,
          password: null, // hash user data to password here
          avatar: picture,
          userName: name,
        });

        await AuthProviderModel.create({
          userId: newUser.id,
          providerName: 'Google',
          providerUserId: res.data.sub,
        });

        const refreshToken = token_require.GenerateRefreshToken(user);
        const accessToken = token_require.GenerateAcessToken(user);
        newUser.refreshToken = refreshToken;

        await newUser.save();

        return response.status(200).json({
          token: accessToken,
          refreshToken: refreshToken,
          user: newUser,
        });
      }

      // generate a accesstoken
      const accessToken = token_require.GenerateAcessToken(isExisted);
      let refreshToken = isExisted.refreshToken;

      const user = isExisted.toJSON();

      delete user.refreshToken;
      delete user.password;

      if (isExisted.refreshToken === '') {
        const newRefreshToken = token_require.GenerateRefreshToken(user);
        isExisted.refreshToken = newRefreshToken;
        refreshToken = newRefreshToken;
        await isExisted.save();
      }

      delete user.password;

      return response.status(200).json({ user: user, token: accessToken, refreshToken });
    } catch (error) {
      response.status(400).json({ message: 'Google token verification failed', error });
    }
  }
}

module.exports = new AuthController();
