require('dotenv').config();
const jwt = require('jsonwebtoken');
const token_require = require('../until/token');

const { StatusCodes } = require('http-status-codes');
const { UserModel } = require('../models');
const AuthorizeError = require('../errors/AuthorizeError');
const NotFoundError = require('../errors/NotFoundError');

const axios = require('axios');
const { createNewUserAuth } = require('../services/authService');
const transporter = require('../services/mailService');
const { x } = require('joi');

const getUserInfoFromFacebook = async (userAccessToken) => {
  try {
    const fields = 'id,name,email,picture,first_name,short_name,last_name';
    const url = `https://graph.facebook.com/me?fields=${fields}&access_token=${userAccessToken}`;
    const response = await axios.get(url);
    const userInfo = response.data;

    return userInfo;
  } catch (error) {
    console.error('Error fetching user information:', error);
    return null;
  }
};

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
      const { email, name, picture, sub } = res.data;
      const isExisted = await UserModel.findOne({
        where: {
          email: email,
        },
      });
      if (isExisted === null) {
        // create account
        const result = await createNewUserAuth({
          email: email,
          userName: name,
          picture: picture,
          providerName: 'Google',
          providerUserId: sub,
        });
        return response.status(200).json(result);
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

  async loginWithFacebook(req, response) {
    const { token } = req.body;
    try {
      const res = await getUserInfoFromFacebook(token);
      if (res === null)
        return response.status(400).json({ message: 'Facebook token verification failed', error });
      const isExisted = await UserModel.findOne({
        where: {
          email: res.email,
        },
      });
      if (isExisted === null) {
        const result = await createNewUserAuth({
          email: res.email,
          userName: res.name,
          picture: res.picture.data.url,
          providerName: 'Facebook',
          providerUserId: res.id,
        });
        return response.status(200).json(result);
      }
      const accessToken = token_require.GenerateAcessToken(isExisted);
      const refreshToken = isExisted.refreshToken;

      const user = isExisted.toJSON();
      delete user.refreshToken;
      delete user.password;

      return response.status(200).json({ user, token: accessToken, refreshToken });
    } catch (error) {
      response.status(400).json({ message: 'Facebook token verification failed', error });
    }
  }

  async forgotPassword(request, response) {
    const { email } = request.body;
    const isExisted = await UserModel.findOne({
      where: {
        email: email,
      },
    });
    if (isExisted === null) throw new NotFoundError({ message: 'Not found user' });

    // Cấu hình email
    const mailOptions = {
      from: 'buithiennhan0345@gmail.com',
      to: email,
      subject: 'Test Email',
      text: 'This is a test email sent using Node.js and Nodemailer!',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
    return response.status(200).json({ email });
  }
}

module.exports = new AuthController();
