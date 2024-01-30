const { SongModel } = require('../models');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

class ListenController {
  async incraseListenCount(req, response) {
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'Must be attached' });

    const song = await SongModel.findByPk(songId);
    if (song === null) throw new NotFoundError({ song: 'Not found this song' });

    song.numberOfListen++;
    await song.save();

    return response.status(200).json({ song });
  }
}
module.exports = new ListenController();
