const mp3Duration = require('mp3-duration');
const { SongModel, UserModel } = require('../models');
const ValidationError = require('../errors/ValidationError');

class SongController {
  async createSong(req, response) {
    const name = req.body.name;
    const description = req.body.description;
    const artistName = req.body.artistName;
    const errors = [];

    // fake iduser

    const userid = 1;

    if (!name) errors.push({ name: 'name must be attached' });
    if (!description) errors.push({ description: 'description must be attached' });
    if (!artistName) errors.push({ artistName: 'artistName must be attached' });

    if (errors.length > 0) throw new ValidationError(errors);
    if (!req.files.song)
      throw new ValidationError({
        song: 'file song must be attached',
      });
    if (!req.files.thumbNail)
      throw new ValidationError({
        thumbNail: 'file thumbnail must be attached',
      });

    const user = await UserModel.findByPk(userid);

    const song = req.files.song[0];
    const thumbNail = req.files.thumbNail[0];

    //Tính toán số giây của file nhạc
    mp3Duration(song.path, async function (err, duration) {
      if (err) {
        console.error(err.message);
        return;
      }

      const newSong = await SongModel.create({
        name: name,
        description: description,
        artistName: artistName,
        linkFile: song.filename,
        thumbNail: thumbNail.filename,
        duration: duration,
      });

      await user.addSong(newSong);
      return response.status(200).json({ isSuccess: true, data: newSong });
    });
  }
}

module.exports = new SongController();
