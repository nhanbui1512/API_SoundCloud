const { Op } = require('sequelize');
const { PlayListModel, UserModel, SongModel, sequelize, GenreModel } = require('../models');
const { multiSqlizeToJSON, SqlizeToJSON } = require('../until/sequelize');
class PlaylistRepository {
  constructor() {}
  async getPlaylists({ page = 1, perPage = 10, search, sort, userId = null }) {
    try {
      const offset = (page - 1) * perPage;
      var condition = {};

      if (search && search.trim() !== '') {
        condition = {
          name: {
            [Op.like]: `%${search}%`,
          },
        };
      }
      var playlists = await PlayListModel.findAll({
        where: condition,
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_playlists WHERE userId = ${userId} AND playlistId = playlists.id) THEN TRUE ELSE FALSE END AS result)`,
              ),
              'isFollowed',
            ],
            [
              sequelize.literal(
                `(SELECT COUNT (*) FROM song_playlist WHERE playlistId = playlists.id)`,
              ),
              'songCount',
            ],
          ],
        },
        include: {
          model: SongModel,
          as: 'songs',
          include: [
            {
              model: GenreModel,
            },
          ],

          attributes: {
            include: [
              [
                sequelize.literal(
                  `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = songs.id) THEN TRUE ELSE FALSE END AS result)`,
                ),
                'isLiked',
              ],
            ],
            exclude: ['genreId'],
          },
        },
        offset: offset,
        limit: perPage,
      });
      playlists = multiSqlizeToJSON(playlists);

      playlists.forEach((playlist) => {
        playlist.isFollowed = playlist.isFollowed === 1 ? true : false;
        playlist.songs.forEach((song) => {
          delete song.song_playlist;
          song.isLiked = song.isLiked === 1 ? true : false;
          song.owner = song.user;
          delete song.user;
        });
      });

      return playlists;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getPlaylistsOfUser(targetUserId, userId) {
    try {
      var user = await UserModel.findByPk(targetUserId, {
        include: {
          model: PlayListModel,
          include: {
            model: SongModel,
            as: 'songs',
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT COUNT(*) FROM userlikesongs WHERE songId = \`playlists->songs\`.id)`,
                  ),
                  'likeCount',
                ],
                [
                  sequelize.literal(
                    `(SELECT CASE WHEN EXISTS (SELECT 1 FROM userlikesongs WHERE userId = ${userId} AND songId = \`playlists->songs\`.id) THEN TRUE ELSE FALSE END AS result)`,
                  ),
                  'isLiked',
                ],
              ],
            },
            include: {
              model: UserModel,
              attributes: {
                exclude: ['password', 'refreshToken'],
              },
            },
          },
          attributes: {
            include: [
              [
                sequelize.literal(
                  `(SELECT COUNT (*) FROM follow_playlists WHERE playlistId = playlists.id)`,
                ),
                'countFollow',
              ],
              [
                sequelize.literal(
                  `(SELECT CASE WHEN EXISTS (SELECT 1 FROM follow_playlists WHERE userId = ${userId} AND playlistId = playlists.id) THEN TRUE ELSE FALSE END AS result)`,
                ),
                'isFollowed',
              ],
            ],
          },
        },
        attributes: {
          exclude: ['password', 'refreshToken'],
        },
      });
      user = SqlizeToJSON(user);

      var playlists = user.playlists;

      playlists.forEach((pl) => {
        pl.isFollowed = pl.isFollowed === 1 ? true : false;
        pl.songs.forEach((song) => {
          song.owner = song.user;
          song.isLiked = song.isLiked === 1 ? true : false;
          delete song.user;
          delete song.song_playlist;
        });
      });
      return playlists;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new PlaylistRepository();
