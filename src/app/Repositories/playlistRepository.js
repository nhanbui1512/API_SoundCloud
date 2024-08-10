const { Op } = require('sequelize');
const { PlayListModel, UserModel, SongModel, sequelize, GenreModel } = require('../models');
const { multiSqlizeToJSON } = require('../until/sequelize');
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
}
module.exports = new PlaylistRepository();
