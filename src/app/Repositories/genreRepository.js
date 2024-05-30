const { GenreModel } = require('../models');

class GenreRepository {
  async delete(id) {
    try {
      const result = await GenreModel.destroy({
        where: {
          id: id,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new GenreRepository();
