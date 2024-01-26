const mp3Duration = require('mp3-duration');
const {
  SongModel,
  UserModel,
  UserLikeSongModel,
  FollowUserModel,
  sequelize,
  GenreModel,
} = require('../models');

const ValidationError = require('../errors/ValidationError');
const NotfoundError = require('../errors/NotFoundError');

class SongController {
  async createSong(req, response) {
    const name = req.body.name;
    const description = req.body.description;
    const artistName = req.body.artistName;
    const genreId = Number(req.body.genreId);

    const errors = [];

    // fake iduser

    const userid = req.userId;

    if (!name) errors.push({ name: 'name must be attached' });
    if (!description) errors.push({ description: 'description must be attached' });
    if (!artistName) errors.push({ artistName: 'artistName must be attached' });
    if (!genreId) errors.push({ genreId: 'genreId is not validation' });

    if (errors.length > 0) throw new ValidationError(errors);
    if (!req.files.song)
      throw new ValidationError({
        song: 'file song must be attached',
      });

    if (!req.files.thumbNail)
      throw new ValidationError({
        thumbNail: 'file thumbnail must be attached',
      });

    const genre = await GenreModel.findByPk(genreId);
    if (genre === null) throw new NotfoundError({ genere: 'Not found' });

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
      await genre.addSong(newSong);
      return response.status(200).json({ isSuccess: true, data: newSong });
    });
  }

  async getSongs(req, response) {
    const currentPage = req.query.page || 1;
    var itemsPerPage = req.query.per_page || 10; // Số bản ghi trên mỗi trang
    if (itemsPerPage > 100) itemsPerPage = 100;

    const offset = (currentPage - 1) * itemsPerPage; // Tính OFFSET

    const page = Number(req.query.page);
    const perPage = Number(req.query.per_page);
    const erros = [];

    if (!page) erros.push({ page: 'page not validation' });
    if (!perPage) erros.push({ perPage: 'per_page not validation' });
    if (erros.length > 0) throw new ValidationError(erros);

    try {
      const songs = await SongModel.findAll({
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
        ],

        limit: Number(itemsPerPage),
        offset: offset,
        order: [['createAt', 'DESC']],
      });

      const ids = songs.map((song) => {
        return song.id;
      });

      var likes = await UserLikeSongModel.findAll({
        where: {
          songId: ids,
        },
      });

      const result = songs.map((song) => {
        song = song.toJSON();
        var count = likes.reduce((likeCount, like) => {
          if (like.songId == song.id) return likeCount + 1;
          else return likeCount;
        }, 0);

        song.likeCount = count;
        return song;
      });

      return response.status(200).json({ data: result });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async LikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });
    const song = await SongModel.findByPk(songId);

    if (song === null)
      throw new NotfoundError({
        song: 'Not found song',
      });

    const liked = await UserLikeSongModel.findOrCreate({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    const result = liked[0].toJSON();

    result.user = user;
    result.song = song;

    return response.send({
      data: result,
    });
  }

  async UnlikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    await UserLikeSongModel.destroy({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    return response.status(200).json({
      isSuccess: true,
      message: 'Unlike the song successfully',
    });
  }
}

module.exports = new SongController();
