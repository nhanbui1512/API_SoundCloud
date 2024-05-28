const { UserModel, FollowUserModel, SongModel, sequelize } = require('../models');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');

class UserRepository {
  async create(data) {
    try {
      var newUser = await UserModel.create(data);
      return newUser;
    } catch (error) {
      throw error;
    }
  }
  async findAll(limit, offset, userId = null) {
    try {
      var { count, rows } = await UserModel.findAndCountAll({
        attributes: {
          exclude: ['refreshToken', 'password'],
          include: [
            [
              sequelize.literal(`(SELECT COUNT(*) FROM songs WHERE songs.ownerId = users.id)`),
              'track',
            ],
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM follow_users WHERE follow_users.user_id = users.id)`,
              ),
              'followingNumber',
            ],
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM follow_users WHERE follow_users.followed = users.id)`,
              ),
              'followerNumber',
            ],
            [
              sequelize.literal(
                `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_users WHERE user_id = ${userId} AND followed = users.id) THEN TRUE ELSE FALSE END AS result)`,
              ),
              'isFollowed',
            ],
          ],
        },
        limit: limit,
        offset: offset,
      });

      rows = multiSqlizeToJSON(rows);
      rows.map((user) => {
        user.isFollowed = Boolean(user.isFollowed);
      });
      return { rows, count };
    } catch (error) {
      throw error;
    }
  }

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

  async findOneByProps(props, attributes) {
    try {
      var user = await UserModel.findOne({
        where: props,
        attributes: attributes,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAllByProps(props, attributes) {
    try {
      var user = await UserModel.findAll({
        where: props,
        attributes: attributes,
        include: [
          {
            model: SongModel,
            attributes: {
              exclude: ['genreId', 'ownerId'],
            },
          },
        ],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteById(id) {
    try {
      var result = await UserModel.destroy({
        where: {
          id: id,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(id, userData) {
    try {
      var result = await UserModel.update(
        { ...userData, updateAt: new Date() },
        {
          where: {
            id: id,
          },
        },
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();
