const ValidationError = require('../errors/ValidationError');
const { FollowUserModel, UserModel, PlayListModel, FollowPlaylistModel } = require('../models');

class Follower {
  async getMyFollowers(req, response) {
    const userId = req.userId;

    const userFollowers = await FollowUserModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: {
        exclude: ['user_id', 'followed', 'createAt', 'updateAt'],
      },
      include: [
        {
          model: UserModel,
          as: 'following',
          attributes: {
            exclude: ['password'],
          },
        },
      ],
    });
    return response.status(200).json({
      result: true,
      data: userFollowers,
    });
  }

  // Follow Playlist

  async followingPlaylist(req, response) {
    const userId = req.userId;
    const playlistId = req.query.idPlaylist;
    if (!playlistId) throw new ValidationError({ message: 'IdPlaylist is not validation' });

    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });
    const playlist = await PlayListModel.findByPk(playlistId);

    if (playlist === null)
      throw new NotfoundError({
        playlist: 'Not found playlist',
      });

    const following = await FollowPlaylistModel.findOrCreate({
      where: {
        userId: userId,
        playlistId: playlistId,
      },
    });

    const result = following[0].toJSON();

    result.user = user;
    result.playlist = playlist;

    return response.send({
      data: result,
    });
  }

  async Unfollowingplaylist(req, response) {
    const userId = req.userId;
    const playlistId = req.query.idPlaylist;
    if (!playlistId) throw new ValidationError({ idPlaylist: 'IdPlaylist is not validation' });

    await FollowPlaylistModel.destroy({
      where: {
        userId: userId,
        playlistId: playlistId,
      },
    });

    return response.status(200).json({
      isSuccess: true,
      message: 'Unlike the playlist successfully',
    });
  }
}

module.exports = new Follower();
