const ValidationError = require('../errors/ValidationError');
const { GenreModel } = require('../models');

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
}

module.exports = new GenreControler();
