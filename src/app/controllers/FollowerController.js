const { where } = require('sequelize');
const { FollowUserModel, UserModel, UserLikeSongModel, SongModel } = require('../models');

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
}

module.exports = new Follower();
