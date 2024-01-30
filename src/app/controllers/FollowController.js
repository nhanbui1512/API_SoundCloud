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
const { multiSqlizeToJSON } = require('../until/sequelize');

class Follower {
  async getCountFollowByIdUser(req, response) {
    const idUser = req.query.idUser;
    if (idUser) {
      var userFollows = await FollowUserModel.findAll({
        where: {
          followed: idUser,
        },
      });
      userFollows = multiSqlizeToJSON(userFollows);
      return response.status(200).json({
        result: true,
        data: userFollows,
      });
    } else {
      return response.status(422).json({
        result: false,
        message: 'IdUser must be attached',
      });
    }
  }
  async getMyFollowing(req, response, next) {
    const userId = req.userId;
    var userFollowers = await FollowUserModel.findAll({
        where: {
          user_id: userId,
        },
        include: {
          model: UserModel,
          as: 'following',
          attributes: {
            exclude: ['password'],
          },
        },
        attributes: {
          exclude: ['user_id'],
        },
      }),
      userFollowers = multiSqlizeToJSON(userFollowers);
    console.log(userFollowers);

    const followingIds = userFollowers.map((follower) => follower.id);
    const userIds = userFollowers.map((user) => user.followed);
    // console.log(followingIds); // Id những người mình follow
    var userFollows = await FollowUserModel.findAll({
      where: {
        followed: userIds,
      },
    });
    userFollows = multiSqlizeToJSON(userFollows);
    console.log(userFollows);

    var songs = await SongModel.findAll({
        // những bài hát của những người mình follow
        where: {
          ownerId: followingIds,
        },
      }),
      songs = multiSqlizeToJSON(songs);

    const songIds = songs.map((song) => song.id); // id những bài hát của những người mình follow
    // console.log(songIds);
    var userLikeSongs = await UserLikeSongModel.findAll({
        where: {
          songId: songIds,
        },
      }),
      userLikeSongs = multiSqlizeToJSON(userLikeSongs);

    songs.map((song) => {
      song.isLiked = userLikeSongs.find(
        (liked) => liked.songId === song.id && liked.userId === userId,
      )
        ? true
        : false;
      song.likeCount = userLikeSongs.filter((liked) => liked.songId === song.id).length;

      return song;
    });

    userFollowers = userFollowers.map((follower) => {
      follower.following.countFollow = 0;
      userFollows.map((user) => {
        if (user.followed === follower.followed) {
          follower.following.countFollow += 1;
        }
      });

      follower.songs = songs.filter((song) => song.ownerId === follower.id);
      follower.following.isFollow = true;
      return follower;
    });

    return response.status(200).json({
      data: {
        count: userFollowers.length,
        data: userFollowers,
      },
    });
  }

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

  async followUser(req, response, next) {
    const userFolled = req.query.user_id;
    const userId = req.userId;
    if (!userFolled) {
      throw new ValidationError({ user_id: 'Must be attached' });
    }

    const user = await UserModel.findByPk(userFolled);

    if (user === null) throw new NotFoundError({ user: 'Not found User' });

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
