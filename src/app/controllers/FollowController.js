const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

const { FollowUserModel, UserModel, UserLikeSongModel, SongModel } = require('../models');
const { multiSqlizeToJSON } = require('../until/sequelize');

class Follower {
  async getMyFollowers(req, response, next) {
    const userFollowers = await FollowUserModel.findAll({
      where: {
        user_id: 1,
      },
      include: {
        model: UserModel,
        as: 'following',
        attributes: {
          exclude: ['password'],
        },
      },
    });

    return response.status(200).json({
      result: true,
      data: userFollowers,
    });
  }
  async followUser(req, response, next) {
    const userFolled = req.query.user_id;
    const userId = req.userId;
    if (!userFolled) {
      throw new ValidationError({ user_id: 'Must be attached' });
    }

    const user = await UserModel.findByPk(userFolled);

    if (user === null) throw new NotFoundError({ user: 'Not found User' });

    const result = await FollowUserModel.findOrCreate({
      where: {
        user_id: userId,
        followed: userFolled,
      },
    });

    const dataResponse = await FollowUserModel.findByPk(result[0].toJSON().id, {
      include: [
        {
          as: 'follower',
          model: UserModel,
          attributes: {
            exclude: ['password'],
          },
        },
        {
          model: UserModel,
          as: 'following',
          attributes: {
            exclude: ['password'],
          },
        },
      ],
      attributes: {
        exclude: ['user_id', 'followed'],
      },
    });

    return response.status(200).json({ data: dataResponse });
  }

  async unFollowUser(req, response, next) {
    const userFolled = req.query.user_id;
    const userId = req.userId;
    if (!userFolled) {
      throw new ValidationError({ user_id: 'Must be attached' });
    }

    const result = await FollowUserModel.destroy({
      where: {
        followed: userFolled,
        user_id: userId,
      },
    });

    const message = result === 1 ? 'Unfollow user successfully' : 'Not found';

    response.status(200).json({ status: 200, deleted: result, message });
  }
}

module.exports = new Follower();
