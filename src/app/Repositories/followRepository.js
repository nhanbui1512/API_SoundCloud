const { FollowUserModel, UserModel, sequelize, SongModel } = require('../models');
const { multiSqlizeToJSON } = require('../until/sequelize');

class FollowRepository {
  async getFollower(targetId, userId = null) {
    try {
      let followers = await FollowUserModel.findAll({
        where: {
          user_id: targetId,
        },
        include: {
          model: UserModel,
          as: 'following',
          attributes: {
            include: [
              [
                sequelize.literal(
                  `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_users WHERE user_id = ${userId} AND followed = following.id) THEN TRUE ELSE FALSE END AS result)`,
                ),
                'isFollowed',
              ],
              [
                sequelize.literal(
                  `(SELECT COUNT (*) FROM follow_users WHERE followed = following.id)`,
                ),
                'countFollow',
              ],
            ],
            exclude: ['password', 'refreshToken'],
          },
          include: {
            model: SongModel,
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = \`following->songs\`.id) THEN TRUE ELSE FALSE END AS result)`,
                  ),
                  'isLiked',
                ],
                [
                  sequelize.literal(
                    `(select count (*) from userlikesongs where songId = \`following->songs\`.id )`,
                  ),
                  'likeCount',
                ],
              ],
            },
          },
        },
      });
      followers = multiSqlizeToJSON(followers);
      followers.forEach((follower) => {
        follower.following.isFollowed = follower.following.isFollowed === 1 ? true : false;
        follower.songs = follower.following.songs;
        delete follower.following.songs;
        follower.songs.forEach((item) => {
          item.isLiked = item.isLiked === 1 ? true : false;
        });
      });
      return followers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FollowRepository();
