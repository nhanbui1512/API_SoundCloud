const { UserModel } = require('../models');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const { isValidEmail } = require('../until/email');

class UserController {
  async registerUser(req, response, next) {
    const data = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
    };

    if (!data.userName || !data.email || !data.password) {
      throw new ValidationError({
        message: 'The data is not filled',
      });
    }

    if (!isValidEmail(data.email))
      throw new ValidationError({
        email: 'Email not validation',
      });

    const user = await UserModel.findOne({
      where: {
        email: data.email,
      },
    });

    if (user) {
      throw new ValidationError({ email: 'Email is exist' });
    } else {
      const newUser = await UserModel.create(data);
      return response.status(200).json({
        result: true,
        newUser,
      });
    }
  }

  async updateUser(req, response, next) {
    const userId = req.userId;
    console.log(userId);

    const user = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      user.userName = req.body.userName;
      user.city = req.body.city || null;
      user.country = req.body.country || null;
      user.bio = req.body.bio || null;

      const newUser = await user.save();
      return response.status(200).json({
        result: true,
        data: { ...newUser.dataValues, password: null },
        message: 'Update successfully',
      });
    } else {
      throw new NotFoundError({
        message: 'User not found!',
      });
    }
  }

  async changePassWord(req, response, next) {
    const userId = req.userId;
    const ownPass = req.body.ownPassWord;
    const newPass = req.body.newPassWord;
    const confirmPass = req.body.confirmPassWord;
    console.log(newPass, confirmPass, ownPass);
    if (!ownPass || !newPass || !confirmPass) {
      return response.status(400).json({
        result: false,
        message: 'Must be filled out completely',
      });
    }
    if (newPass != confirmPass) {
      return response.status(400).json({
        result: false,
        message: 'Pass new and comfirm is not alike',
      });
    } else {
      const user = await UserModel.findOne({
        where: {
          id: userId,
          password: ownPass,
        },
      });
      if (user) {
        user.password = newPass;
        const newUser = await user.save();
        return response.status(200).json({
          result: true,
          data: { ...newUser.dataValues, password: null },
          message: 'User was update pass successfully',
        });
      } else {
        return response.status(400).json({
          result: false,
          message: 'User not found',
        });
      }
    }
  }

  async getMyProfile(req, response, next) {}
}

module.exports = new UserController();
