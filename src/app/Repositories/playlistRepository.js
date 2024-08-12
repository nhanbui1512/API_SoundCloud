const { Op } = require('sequelize');
const {
  PlayListModel,
  UserModel,
  SongModel,
  sequelize,
  GenreModel,
  SongPlaylistModel,
} = require('../models');
const { multiSqlizeToJSON, SqlizeToJSON } = require('../until/sequelize');
const NotFoundError = require('../errors/NotFoundError');
class PlaylistRepository {
  constructor() {}
  //#region  get playlists
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
  //#endregion

  //#region get playlist of user
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
  //#endregion

  //#region add songs
  async addSongs(songIds = [], playlistId, userId) {
    try {
      const playlist = await PlayListModel.findOne({
        where: {
          id: playlistId,
          userId: userId,
        },
      });
      if (playlist === null) throw new NotFoundError({ message: 'Not found playlist' });

      var filterSongIds = Array.of(...new Set(songIds));
      console.log(filterSongIds);
      var newSongPlaylists = filterSongIds.map((song) => {
        return { songId: song, playlistId: playlist.id };
      });

      var promises = newSongPlaylists.map((item) => {
        return SongPlaylistModel.findOrCreate({
          where: {
            songId: item.songId,
            playlistId: item.playlistId,
          },
        });
      });

      const result = await Promise.all(promises);
      return result;
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region delete songs
  async deleteSongs(songIds, playlistId, userId) {
    try {
      const playlist = await PlayListModel.findOne({
        where: {
          id: playlistId,
          userId: userId,
        },
      });
      if (!playlist) throw new NotFoundError({ message: 'Not found playlist' });
      const filterIds = Array.of(...new Set(songIds));
      const conditions = filterIds.map((item) => {
        return { songId: item, playlistId: playlistId };
      });

      const result = await SongPlaylistModel.destroy({
        where: {
          [Op.or]: conditions,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region update
  async update(name, playlistId, userId) {
    try {
      const playlist = await PlayListModel.findOne({
        where: {
          userId: userId,
          id: playlistId,
        },
      });
      if (playlist === null) throw new NotFoundError({ message: 'Not found playlist' });

      playlist.name = name || playlist.name;
      playlist.updateAt = new Date();
      await playlist.save();
      return playlist;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  //#endregion
}

module.exports = new PlaylistRepository();
