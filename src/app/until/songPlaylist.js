const { SongPlaylistModel, PlayListModel, SongModel } = require('../models');
const { multiSqlizeToJSON } = require('./sequelize');

const createSongPlaylist = async (idSongs, idPlaylist, typef = 'add') => {
  try {
    if (idSongs.length && idSongs.length > 0) {
      var songs = await SongModel.findAll({
          where: {
            id: idSongs,
          },
        }),
        songs = multiSqlizeToJSON(songs);

      var songIds = songs.map((song) => song.id);

      // kiểm tra xem song đã tồn tại trong play list
      var songsInPlaylist = await SongPlaylistModel.findAll({
          where: {
            songId: songIds,
            playlistId: idPlaylist,
          },
        }),
        songsInPlaylist = multiSqlizeToJSON(songsInPlaylist);

      // xóa trong songIds nếu tồn tại trong check
      var songIdsInPlaylist = songsInPlaylist.map((songInPlaylist) => songInPlaylist.songId);
      if (songIdsInPlaylist.length < 1) {
        var songPlaylistIds = [];
        songIds.map((songId) => {
          songPlaylistIds.push({
            songId: songId,
            playlistId: Number(idPlaylist),
          });
        });

        await SongPlaylistModel.bulkCreate(songPlaylistIds);
      } else {
        var idSongs = [];
        songIds.forEach((songId) => {
          if (!songIdsInPlaylist.includes(songId)) {
            idSongs.push(songId);
          }
        });

        var songPlaylistIds = [];
        idSongs.map((songId) => {
          songPlaylistIds.push({
            songId: songId,
            playlistId: Number(idPlaylist),
          });
        });
        await SongPlaylistModel.bulkCreate(songPlaylistIds);
      }
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSongPlaylist,
};