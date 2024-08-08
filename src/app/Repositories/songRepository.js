const { SongModel, sequelize, UserModel, GenreModel } = require('../models');

class SongRepository {
  constructor() {}

  async getSongById(songId, userId) {
    try {
      var song = await SongModel.findByPk(songId, {
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT COUNT(*) FROM userlikesongs WHERE songId = ${songId})`),
              'likeCount',
            ],
            [
              sequelize.literal(
                `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = ${songId}) THEN TRUE ELSE FALSE END AS result)`,
              ),
              'isLiked',
            ],
          ],
        },
        include: [
          {
            model: UserModel,
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_users WHERE user_id = user.id AND followed = ${userId}) THEN TRUE ELSE FALSE END AS result)`,
                  ),
                  'isFollowed',
                ],
                [
                  sequelize.literal(
                    `(SELECT COUNT (*) FROM follow_users WHERE followed = user.id)`,
                  ),
                  'followCount',
                ],
              ],
              exclude: ['refreshToken', 'password'],
            },
          },
          {
            model: GenreModel,
          },
        ],
      });
      if (song === null) return null;
      song = song.toJSON();

      song.owner = song.user;
      song.isLiked = song.isLiked === 1 ? true : false;
      song.nameGenre = song.genre.name;

      delete song.user;
      delete song.genre;
      return song;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new SongRepository();
