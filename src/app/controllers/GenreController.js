const ValidationError = require('../errors/ValidationError');
const { GenreModel, SongModel, UserModel, UserLikeSongModel } = require('../models');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');

class GenreControler {
  async getAll(req, response) {
    const types = await GenreModel.findAll({
      attributes: {
        exclude: ['createAt', 'updateAt'],
      },
    });
    return response.status(200).json({ data: types });
  }
  async create(req, response) {
    const name = req.body.name;
    if (!name)
      throw new ValidationError({
        name: 'must be attached',
      });

    const isExist = await GenreModel.findOne({
      where: {
        name: name,
      },
    });

    if (isExist === null) {
      const newGenre = await GenreModel.create({
        name: name,
      });

      return response.status(200).json({
        isSuccess: true,
        newGenre: newGenre,
      });
    } else {
      return response.status(422).json({
        isSuccess: false,
        message: 'Name is existed',
      });
    }
  }

  async getSongsById(req, response) {
    const id = Number(req.query.id);
    const userId = req.userId;

    if (!id) throw new ValidationError({ id: 'Not validation' });

    var data = await GenreModel.findOne({
        where: {
          id: id,
        },
        include: {
          model: SongModel,
          include: {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
        },
      }),
      data = SqlizeToJSON(data);

    const songIds = data.songs.map((song) => song.id);

    var likedSongs = await UserLikeSongModel.findAll({
        where: {
          songId: songIds,
        },
      }),
      likedSongs = multiSqlizeToJSON(likedSongs);

    data.songs = data.songs.map((song) => {
      song.isLiked = likedSongs.find((liked) => liked.userId === userId && liked.songId === song.id)
        ? true
        : false;
      return song;
    });

    return response.status(200).json({ data: data });
  }
}

module.exports = new GenreControler();
