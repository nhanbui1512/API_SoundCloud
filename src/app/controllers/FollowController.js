const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

const {
  FollowUserModel,
  UserModel,
  FollowPlaylistModel,
  PlayListModel,
  SongModel,
  UserLikeSongModel,
} = require('../models');
const followRepository = require('../Repositories/followRepository');
const { multiSqlizeToJSON } = require('../until/sequelize');

class Follower {
  async getCountFollowByIdUser(req, response) {
    const idUser = req.query.idUser;
    const followers = await followRepository.getFollower(idUser);
    return response.status(200).json({ data: followers });
  }

  // Lấy ra những người mình đang follow
  async getMyFollowing(req, response, next) {
    const userId = req.userId;
    const followers = await followRepository.getFollower(userId, userId);

    return response.status(200).json({
      data: {
        count: followers.length,
        data: followers,
      },
    });
  }

  // Lấy ra những người đang follow mình
  async getMyFollowers(req, response, next) {
    const userId = req.userId;
    const followers = await FollowUserModel.findAndCountAll({
      where: {
        followed: userId,
      },
      include: {
        model: UserModel,
        as: 'follower',
      },
      attributes: {
        exclude: ['user_id'],
      },
    });

    return response.status(200).json({
      count: followers.count,
      data: followers.rows,
    });
  }

  // Action follow
  async followUser(req, response, next) {
    const userFolled = req.query.user_id;
    const userId = req.userId;
    if (!userFolled) {
      throw new ValidationError({ user_id: 'Must be attached' });
    }

    const user = await UserModel.findByPk(userFolled);

    if (user === null) throw new NotFoundError({ user: 'Not found User' });
    if (userId === userFolled) throw new NotFoundError({ user: 'My user' });

    const checkFollow = await FollowUserModel.findOne({
      where: {
        user_id: userId,
        followed: userFolled,
      },
    });
    if (checkFollow) {
      return response.status(200).json({ result: true, message: 'You followed user' });
    } else {
      const result = await FollowUserModel.findOrCreate({
        where: {
          user_id: userId,
          followed: userFolled,
        },
      });

      const dataResponse = await FollowUserModel.findByPk(result[0].toJSON().id, {
        include: [
          {
            as: 'follower',
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
          {
            model: UserModel,
            as: 'following',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
        attributes: {
          exclude: ['user_id', 'followed'],
        },
      });
      return response.status(200).json({ data: dataResponse });
    }
  }

  // Action Unfollow
  async unFollowUser(req, response, next) {
    const userFolled = req.query.user_id;
    const userId = req.userId;
    if (!userFolled) {
      throw new ValidationError({ user_id: 'Must be attached' });
    }

    const result = await FollowUserModel.destroy({
      where: {
        followed: userFolled,
        user_id: userId,
      },
    });

    const message = result === 1 ? 'Unfollow user successfully' : 'Not found';

    response.status(200).json({ status: 200, deleted: result, message });
  }

  // Lấy ra playlist đang follow của mình
  async MyPlaylists(req, response) {
    const userId = req.userId;

    const playlistFollow = await FollowPlaylistModel.findAll({
      where: {
        userId: userId,
      },
    });
    return response.status(200).json({
      result: true,
      data: playlistFollow,
    });
  }

  async followPlaylist(req, response) {
    const userId = req.userId;
    const playlistId = Number(req.query.idPlaylist);
    if (!playlistId) throw new ValidationError({ message: 'IdPlaylist is not validation' });

    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });
    const playlist = await PlayListModel.findByPk(playlistId);

    if (playlist === null)
      throw new NotFoundError({
        playlist: 'Not found playlist',
      });

    const checkFollow = await FollowPlaylistModel.findOne({
      where: {
        userId: userId,
        playlistId: playlistId,
      },
    });

    if (checkFollow) {
      return response.status(200).json({ data: playlist });
    } else {
      if (userId != playlist.toJSON().userId) {
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
      } else {
        return response.status(400).json({
          result: false,
          message: 'The playlist are user-owned',
        });
      }
    }
  }

  async Unfollowplaylist(req, response) {
    const userId = req.userId;
    const playlistId = Number(req.query.idPlaylist);
    if (!playlistId) throw new ValidationError({ idPlaylist: 'IdPlaylist is not validation' });

    await FollowPlaylistModel.destroy({
      where: {
        userId: userId,
        playlistId: playlistId,
      },
    });

    return response.status(200).json({
      isSuccess: true,
      message: 'UnFollow the playlist successfully',
    });
  }
}

module.exports = new Follower();
