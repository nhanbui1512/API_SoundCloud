const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const { SongModel } = require('../models');

class LoopController {
  async increaseLoopCount(req, response) {
    const songId = Number(req.query.song_id);
    if (!songId) throw new ValidationError({ song_id: 'Song id not validation' });
    const song = await SongModel.findByPk(songId);

    if (song === null) throw new NotFoundError({ song: 'Not found song' });
    song.numberOfLoop++;
    await song.save();

    return response
      .status(200)
      .json({ isSuccess: true, message: 'Increase number of loop successfully', data: song });
  }
}

module.exports = new LoopController();
