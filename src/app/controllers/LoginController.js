const token_require = require('../until/token');
const bcrypt = require('bcrypt');
const ValidationError = require('../errors/ValidationError');
const userRepository = require('../Repositories/userRepository');
const AuthorizeError = require('../errors/AuthorizeError');

class LoginController {
  async checkLogin(req, response) {
    const email = req.body.email;
    const password = req.body.password;

    const errors = [];
    if (!email) errors.push({ email: 'Not validaton' });
    if (!password) errors.push({ password: 'Not validation' });

    if (errors.length > 0) throw new ValidationError(errors);

    try {
      var user = await userRepository.findOneByProps({ email: email });
      if (user === null) throw new AuthorizeError({ message: 'Email or password is wrong' });

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) throw new AuthorizeError({ message: 'Email or password is wrong' });

      const token = token_require.GenerateAcessToken(user);
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
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new LoginController();
