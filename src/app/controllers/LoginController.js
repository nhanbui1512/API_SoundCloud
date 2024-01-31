const token_require = require('../until/token');
const { UserModel } = require('../models');
const bcrypt = require('bcrypt');
const ValidationError = require('../errors/ValidationError');

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
        return response
          .status(401)
          .json({ status: 401, isSuccess: false, message: 'email or password is wrong' });
      } else {
        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword)
          return response
            .status(401)
            .json({ status: 401, isSuccess: false, message: 'Email or password is wrong' });

        user = user.toJSON();
        delete user.password;
        const token = token_require.GenerateAccpectToken(user);
        return response.status(200).json({ result: true, token: token, user: user });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: error.message });
    }
  }
}
module.exports = new LoginController();
