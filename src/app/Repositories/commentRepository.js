const NotFoundError = require('../errors/NotFoundError');
const { UserModel, CommentModel } = require('../models');

class CommentRepository {
  //#region  find by id
  async findBySongId(songId, perPage, offset) {
    const getComments = async (parentId = null, limit, offset) => {
      const comments = await CommentModel.findAll({
        where: {
          songId: songId,
          parentId: parentId,
        },
        include: [
          {
            model: CommentModel,
            as: 'Replies',
          },
          {
            model: UserModel,
            attributes: {
              exclude: ['password', 'refreshToken', 'roleId'],
            },
          },
        ],
        limit: limit,
        offset: offset,
        order: [['createAt', 'DESC']],
      });

      for (const comment of comments) {
        comment.dataValues.Replies = await getComments(comment.id);
      }

      return comments;
    };

    return await getComments(null, perPage, offset);
  }
  //#endregion

  //#region get children comments
  async getChilrenComments(commentId, perPage, offset) {
    try {
      const { count, rows } = await CommentModel.findAndCountAll({
        where: {
          parentId: commentId,
        },
        include: {
          model: UserModel,
          attributes: {
            exclude: ['password', 'refreshToken', 'roleId'],
          },
        },
        limit: perPage,
        offset: offset,
        order: [['createAt', 'DESC']],
      });

      return { count, rows };
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region  update
  async update(commentId, userId, content) {
    try {
      const comment = await CommentModel.findOne({
        where: {
          id: commentId,
          userId,
        },
      });
      if (comment === null) throw new NotFoundError({ message: 'Not found comment' });
      comment.content = content;
      comment.updateAt = new Date();
      await comment.save();
      return comment;
    } catch (error) {
      throw error;
    }
  }
  ////#endregion

  //#region delete
  async delete(commentId, userId) {
    try {
      const alterRows = await CommentModel.destroy({
        where: {
          id: commentId,
          userId: userId,
        },
      });
      return alterRows;
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region find by id
  async findById(commentId) {
    try {
      const comment = await CommentModel.findByPk(commentId);
      return comment;
    } catch (error) {
      throw error;
    }
  }
  //#endregion
}
module.exports = new CommentRepository();
