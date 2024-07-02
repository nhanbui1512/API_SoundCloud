const { StatusCodes } = require('http-status-codes');
const { CommentModel, SongModel, UserModel } = require('../models');
const NotFoundError = require('../errors/NotFoundError');
const pagination = require('../until/paginations');
const commentRepository = require('../Repositories/commentRepository');

async function getCommentsBySongId(songId, perPage, offset) {
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
    });

    for (const comment of comments) {
      comment.dataValues.Replies = await getComments(comment.id);
    }

    return comments;
  };

  return await getComments(null, perPage, offset);
}

class CommentController {
  async getComments(req, response) {
    const { song_id, comment_id } = req.query;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;
    const offset = (page - 1) * perPage; // Tính OFFSET

    // nếu lấy ra các comment con của 1 comment
    if (comment_id) {
      const { count, rows } = await commentRepository.getChilrenComments(
        comment_id,
        perPage,
        offset,
      );
      const paginateData = pagination({ page, perPage, count });

      return response.status(StatusCodes.OK).json({ ...paginateData, data: rows });
    }

    const countAll = await CommentModel.count({
      where: {
        songId: song_id,
      },
    });
    // nếu muốn lấy ra tất cả comment từ bài hát bất kỳ
    getCommentsBySongId(song_id, perPage, offset)
      .then((comments) => {
        const paginateData = pagination({ page, perPage, count: countAll });
        response.status(StatusCodes.OK).json({ ...paginateData, data: comments });
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
    const userId = req.userId;
    const alterRows = await commentRepository.delete(comment_id, userId);
    if (alterRows === 0) throw new NotFoundError({ message: 'Not found comment' });
    return response.status(200).json();
  };

  update = async (req, response) => {
    const commentId = req.body.comment_id;
    const content = req.body.content; // content of comment
    const userId = req.userId;
    const updatedComment = await commentRepository.update(commentId, userId, content);

    return response.status(StatusCodes.OK).json({ data: updatedComment });
  };
}
module.exports = new CommentController();
