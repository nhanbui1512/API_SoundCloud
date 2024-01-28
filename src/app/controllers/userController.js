const { UserModel, SongModel, FollowUserModel } = require('../models');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const { isValidEmail } = require('../until/email');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');
const { Op } = require('sequelize');

class UserController {
  // POST    /user/register
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

  // PUT  /user/update
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

  // PUT  /user/change-password
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

  // GET  /user/get-profile
  async getMyProfile(req, response, next) {
    const userId = req.userId;
    var user = await UserModel.findByPk(userId, {
      include: [
        {
          model: SongModel,
        },
      ],
      attributes: {
        exclude: ['password'],
      },
    });

    if (user !== null) {
      user = SqlizeToJSON(user);
    }

    var followers = await FollowUserModel.findAll({
      where: {
        [Op.or]: [{ followed: userId }, { user_id: userId }],
      },
    });

    const followingCount = followers.reduce((total, follow) => {
      if (follow.user_id === userId) return total + 1;
      return total;
    }, 0);

    const followerCount = followers.reduce((total, follow) => {
      if (follow.followed === userId) return total + 1;
      return total;
    }, 0);

    user.track = user.songs.length;
    user.followingNumber = followingCount;
    user.followerNumber = followerCount;

    return response.status(200).json({ data: user });
  }

  // GET  /user?user_id=2
  async findUser(req, response, next) {
    const userIdFind = Number(req.query.user_id);
    const userId = req.userId || null;

    if (!userIdFind) throw new ValidationError({ user_id: 'Not validation' });

    var user = await UserModel.findByPk(userIdFind, {
      include: [
        {
          model: SongModel,
        },
      ],

      attributes: {
        exclude: ['password'],
      },
    });
    // parse sequelize object -> JSON
    user = SqlizeToJSON(user);

    if (user !== null) {
      // lấy ra những người đã follow  user
      var follower = await FollowUserModel.findAndCountAll({
        where: {
          followed: userIdFind,
        },
      });

      var following = await FollowUserModel.findAndCountAll({
        where: {
          user_id: userIdFind,
        },
      });

      user.followerNumber = follower.count;
      user.followingNumber = following.count;
      // Nếu người dùng có gửi token lên thì kiểm tra xem đã follow user tìm kiếm hay chưa

      follower = multiSqlizeToJSON(follower.rows);
      const isFollowed = follower.find((follower) => follower.user_id === userId);
      user.isFollowed = isFollowed ? true : false;
    }

    return response.status(200).json({ data: user });
  }

  // GET   /user/search?value=timkiemuser
  async searchUser(req, response) {
    const userId = req.userId || null;

    const value = req.query.value;
    if (!value || value.trim() === '') throw new ValidationError({ value: 'Not validation' });

    var users = await UserModel.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${value}%` } },
          {
            userName: {
              [Op.like]: `%${value}%`,
            },
          },
        ],
      },
      include: [{ model: SongModel }],
    });

    const userIds = users.map((user) => user.id);

    var followers = await FollowUserModel.findAll({
      where: {
        followed: userIds,
      },
    });

    followers = multiSqlizeToJSON(followers);

    users = users.map((user) => {
      user = SqlizeToJSON(user);
      user.track = user.songs.length;

      user.followerCount = followers.reduce((total, follow) => {
        if (follow.followed === user.id) return total + 1;
        else return total;
      }, 0);

      user.isFollowed = followers.find((follow) => (follow.user_id = userId)) ? true : false;

      return user;
    });

    return response.status(200).json({ data: users });
  }
}

module.exports = new UserController();
