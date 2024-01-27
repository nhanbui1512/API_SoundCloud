const { SongPlaylistModel } = require('../models');

const createSongPlaylist = async (idSongs, idPlaylist, typef = 'add') => {
  if (idSongs.length > 0) {
    idSongs.map(async (idSong) => {
      const checkFollow = await SongPlaylistModel.findOne({
        where: {
          songId: idSong,
          playlistId: idPlaylist,
        },
      });

      if (!checkFollow) {
        await SongPlaylistModel.findOrCreate({
          where: {
            songId: idSong,
            playlistId: idPlaylist,
          },
        });
      }
    });
  }
};

module.exports = {
  createSongPlaylist,
};
