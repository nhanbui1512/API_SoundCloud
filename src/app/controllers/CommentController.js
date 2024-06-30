const { StatusCodes } = require('http-status-codes');
const { CommentModel, SongModel, UserModel } = require('../models');
const NotFoundError = require('../errors/NotFoundError');

async function getCommentsBySongId(songId) {
  const getComments = async (parentId = null) => {
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
    });

    for (const comment of comments) {
      comment.dataValues.Replies = await getComments(comment.id);
    }

    return comments;
  };

  return await getComments();
}

class CommentController {
  async getComments(req, response) {
    const { page, per_page, song_id } = req.query;
    getCommentsBySongId(song_id)
      .then((comments) => {
        response.status(StatusCodes.OK).json({ data: comments });
      })
      .catch((err) => {
        throw err;
      });
  }
  async createComment(req, response) {
    const songId = Number(req.body.song_id);
    const commentId = req.body.comment_id;
    const content = req.body.content;
    const userId = req.userId;

    const song = await SongModel.findByPk(songId);
    // check song is existed ?
    if (song === null) throw new NotFoundError({ message: 'Not found song' });

    if (commentId) {
      const comment = await CommentModel.findByPk(commentId);
      if (comment === null) throw new NotFoundError({ message: 'Not found comment' });
    }
    const newComment = await CommentModel.create({
      parentId: commentId,
      content: content,
      userId: userId,
      songId: song.id,
    });
    return response.status(StatusCodes.OK).json({ data: newComment });
  }

  delete = async (req, response) => {
    const { comment_id } = req.query;
    await CommentModel.destroy({
      where: {
        id: comment_id,
        userId: req.userId,
      },
    });
    return response.status(200).json();
  };
}
module.exports = new CommentController();
