const { bool } = require('joi');
const { UserModel, FollowUserModel, SongModel, sequelize } = require('../models');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');
const { Op } = require('sequelize');

class UserRepository {
  async findById(id, userId = null) {
    // id là của người muốn tìm kiếm , userId là của authorize
    try {
      var user = await UserModel.findByPk(id, {
        include: [
          {
            model: SongModel,
            attributes: {
              include: [
                [
                  sequelize.literal(
                    '(SELECT COUNT(*) FROM userlikesongs WHERE userlikesongs.songId = songs.id)',
                  ),
                  'likeCount',
                ],
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = songs.id) THEN TRUE ELSE FALSE END AS result)`,
                  ),
                  'isLiked',
                ],
              ],
            },
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT COUNT(*) FROM songs WHERE songs.ownerId = ${id})`),
              'track',
            ],
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM follow_users WHERE follow_users.user_id = ${id})`,
              ),
              'followingNumber',
            ],
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM follow_users WHERE follow_users.followed = ${id})`,
              ),
              'followerNumber',
            ],
            [
              sequelize.literal(
                `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_users WHERE user_id = ${userId} AND followed = ${id}) THEN TRUE ELSE FALSE END AS result)`,
              ),
              'isFollowed',
            ],
          ],
          exclude: ['password', 'refreshToken'],
        },
      });

      if (user === null) {
        return user;
      }

      user = SqlizeToJSON(user);
      user.songs.sort((a, b) => {
        return b.createAt - a.createAt;
      });

      user.songs.map((song) => {
        song.isLiked = Boolean(song.isLiked);
      });

      user.isFollowed = Boolean(user.isFollowed);

      return user;
    } catch (error) {
      throw error;
    }
  }
  async findAll() {}
  async deleteById(id) {}
  async updateUser(id, userData) {}
}

module.exports = new UserRepository();
