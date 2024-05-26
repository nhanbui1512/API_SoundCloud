const token_require = require('../until/token');
const { UserModel } = require('../models');
const bcrypt = require('bcrypt');
const ValidationError = require('../errors/ValidationError');
const { StatusCodes } = require('http-status-codes');

class LoginController {
  async checkLogin(req, response) {
    const email = req.body.email;
    const password = req.body.password;

    const errors = [];
    if (!email) errors.push({ email: 'Not validaton' });
    if (!password) errors.push({ password: 'Not validation' });

    if (errors.length > 0) throw new ValidationError(errors);

    try {
      var user = await UserModel.findOne({
        where: {
          email: email,
        },
      });

      if (user === null) {
        return response.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          isSuccess: false,
          message: 'Email or password is wrong',
        });
      } else {
        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword)
          return response.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            isSuccess: false,
            message: 'Email or password is wrong',
          });

        const token = token_require.GenerateAccpectToken(user);
        const refreshToken = token_require.GenerateRefreshToken(user);

        user = user.toJSON();

        delete user.refreshToken;
        delete user.password;

        if (user.refreshToken === '') {
          user.refreshToken = refreshToken;
          await user.save();
        }

        return response
          .status(200)
          .json({ result: true, token: token, refreshToken: refreshToken, user: user });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: error.message });
    }
  }
}
module.exports = new LoginController();
