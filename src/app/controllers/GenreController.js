const ValidationError = require('../errors/ValidationError');
const { GenreModel, SongModel, UserModel, UserLikeSongModel } = require('../models');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');
const NotFoundError = require('../errors/NotFoundError');

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
          limit: Number(itemsPerPage),
          offset: offset,
          order: [['createAt', 'DESC']],
        },
      }),
      data = SqlizeToJSON(data);

    if (data === null) throw new NotFoundError({ message: 'Not found genre' });

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
