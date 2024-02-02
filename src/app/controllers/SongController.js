const mp3Duration = require('mp3-duration');
const {
  SongModel,
  UserModel,
  UserLikeSongModel,
  FollowUserModel,
  GenreModel,
  PlayListModel,
  SongPlaylistModel,
} = require('../models');

const cloudinary = require('cloudinary').v2;

const ValidationError = require('../errors/ValidationError');
const NotfoundError = require('../errors/NotFoundError');
const { multiSqlizeToJSON, SqlizeToJSON } = require('../until/sequelize');
const { shuffleArray } = require('../until/arrays');
const { Op, Sequelize } = require('sequelize');
const { DeleteFile } = require('../until/manageFile');
const NotFoundError = require('../errors/NotFoundError');

class SongController {
  // Tạo nhạc
  async createSong(req, response) {
    const name = req.body.name;
    const description = req.body.description;
    const artistName = req.body.artistName;
    const genreId = Number(req.body.genreId);

    const errors = [];

    const userid = req.userId;

    if (!name) errors.push({ name: 'name must be attached' });
    if (!description) errors.push({ description: 'description must be attached' });
    if (!artistName) errors.push({ artistName: 'artistName must be attached' });
    if (!genreId) errors.push({ genreId: 'genreId is not validation' });

    if (errors.length > 0) throw new ValidationError(errors);
    if (!req.files.song)
      throw new ValidationError({
        song: 'file song must be attached',
      });

    if (!req.files.thumbNail)
      throw new ValidationError({
        thumbNail: 'file thumbnail must be attached',
      });

    const genre = await GenreModel.findByPk(genreId);
    if (genre === null) throw new NotfoundError({ genere: 'Not found' });

    const user = await UserModel.findByPk(userid);

    const song = req.files.song[0];
    const thumbNail = req.files.thumbNail[0];

    // console.log(song);
    // console.log(thumbNail);
    //Tính toán số giây của file nhạc

    const uploadOptions = {
      transformation: {
        width: 400, // Chiều rộng mới
        height: 400, // Chiều cao mới
        crop: 'fill', // Phương pháp cắt ảnh
        format: 'jpg', // Định dạng mới
      },
      folder: 'images', // Thư mục trên Cloudinary để lưu ảnh
      resource_type: 'auto',
    };

    mp3Duration(song.path, async function (err, duration) {
      if (err) {
        console.error(err.message);
        return response.status(400).json({
          isSuccess: false,
          message: 'Create Song fail',
        });
      }

      if (duration < 60) {
        return response.status(400).json({ isSuccess: false, message: 'Audio file is too short' });
      }

      const imageUploaded = await cloudinary.uploader.upload(thumbNail.path, uploadOptions);

      const songUploaded = await cloudinary.uploader.upload(song.path, {
        folder: 'audios', // Tên thư mục bạn muốn sử dụng
        resource_type: 'auto',
      });

      try {
        const newSong = await SongModel.create({
          name: name,
          description: description,
          artistName: artistName,
          linkFile: songUploaded.url,
          thumbNail: imageUploaded.url,
          duration: duration,
        });

        await user.addSong(newSong);
        await genre.addSong(newSong);

        await DeleteFile(song.path);
        await DeleteFile(thumbNail.path);

        return response.status(200).json({ isSuccess: true, data: newSong });
      } catch (error) {
        throw error;
      }
    });
  }

  // GET  /song/get-songs?page=2&per_page=12
  async getSongs(req, response) {
    const userId = req.userId || null;

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

    try {
      var songs = await SongModel.findAll({
          include: [
            {
              model: UserModel,
              attributes: {
                exclude: ['password'],
              },
            },
            {
              model: GenreModel,
              attributes: {
                exclude: ['createAt', 'updateAt'],
              },
            },
          ],
          attributes: {
            exclude: ['genreId', 'ownerId'],
          },
          limit: Number(itemsPerPage),
          offset: offset,
          order: [['createAt', 'DESC']],
        }),
        songs = multiSqlizeToJSON(songs);

      const ids = songs.map((song) => {
        return song.id;
      });

      var ownerIds = songs.map((song) => song.user.id);
      ownerIds = ownerIds.filter((item, index) => ownerIds.indexOf(item) === index);

      var followed = []; // những người sở hữu bài hát mà được user follow
      if (userId !== null) {
        followed = await FollowUserModel.findAll({
          where: {
            followed: ownerIds,
            user_id: userId,
          },
        });
        followed = multiSqlizeToJSON(followed);
      }

      var likes = await UserLikeSongModel.findAll({
        where: {
          songId: ids,
        },
        include: {
          model: UserModel,
          as: 'user',
        },
      });

      let result = songs.map((song) => {
        if (userId === null) song.user.isFollowed = false;
        else {
          song.user.isFollowed = followed.find((follow) => follow.followed === song.user.id)
            ? true
            : false;
        }
        song.owner = song.user;
        delete song.user;

        var count = likes.reduce((likeCount, like) => {
          if (like.songId == song.id) return likeCount + 1;
          else return likeCount;
        }, 0);

        song.likeCount = count; // số like

        // đã like hay chưa
        song.isLiked = likes.find((like) => like.userId === userId && song.id === like.songId)
          ? true
          : false;

        return song;
      });
      // Xáo trộn mảng
      result = shuffleArray(result);

      return response.status(200).json({ data: result });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // GET     /song/getsong?song_id=12
  async getSongById(req, response) {
    const songId = req.query.song_id;
    if (!songId) throw ValidationError({ song_id: 'Must be attached' });
    const userId = req.userId || null;

    var song = await SongModel.findByPk(songId, {
      include: [
        {
          model: UserModel,
          attributes: {
            exclude: ['password'],
          },
        },
        {
          model: GenreModel,
        },
      ],
    });

    if (song === null) throw new NotFoundError({ song: 'Not found this song' });

    song = SqlizeToJSON(song);
    song.owner = song.user;
    song.nameGenre = song.genre.name;
    delete song.user;
    delete song.genre;

    const likesOfThisSong = await UserLikeSongModel.findAll({
      where: {
        songId: songId,
      },
    });

    // lay ra so nguoi theo doi
    var usersFollow = await FollowUserModel.findAll({
      where: {
        followed: song.ownerId,
      },
    });
    usersFollow = multiSqlizeToJSON(usersFollow);

    // kiem tra coi theo doi chu bai hat chua
    song.owner.isFollowed = false;

    usersFollow.map((userFollow) => {
      if (song.ownerId === userFollow.followed && userId === userFollow.user_id) {
        song.owner.isFollowed = true;
      }
    });

    // nếu người dùng có gửi token lên (đã login)
    if (userId) {
      song.isLiked = false;
      const isLiked = multiSqlizeToJSON(likesOfThisSong).find((item) => item.userId === userId);
      if (isLiked) song.isLiked = true;
    }

    // nếu người dùng có gửi token lên (đã login)
    if (userId !== null) {
      const isLiked = multiSqlizeToJSON(likesOfThisSong).find((item) => item.userId === userId);
      song.isLiked = isLiked ? true : false;

      const isFollowed = await FollowUserModel.findOne({
        where: {
          followed: song.ownerId,
          user_id: userId,
        },
      });
      song.owner.isFollowed = isFollowed !== null ? true : false;
    }
    song.likeCount = likesOfThisSong.length;
    song.followCount = usersFollow.length;

    return response.status(200).json({ song: song });
  }

  //  POST    /song/like?song_id =1
  async LikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });
    const song = await SongModel.findByPk(songId);

    if (song === null)
      throw new NotfoundError({
        song: 'Not found song',
      });

    const liked = await UserLikeSongModel.findOrCreate({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    const result = liked[0].toJSON();

    result.user = user;
    result.song = song;

    return response.send({
      data: result,
    });
  }

  async UnlikeSong(req, response) {
    const userId = req.userId;
    const songId = req.query.song_id;
    if (!songId) throw new ValidationError({ song_id: 'song_id is not validation' });

    await UserLikeSongModel.destroy({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    return response.status(200).json({
      isSuccess: true,
      message: 'Unlike the song successfully',
    });
  }

  // DELETE /song
  async deleteSong(req, response) {
    const songId = Number(req.query.song_id);
    const userId = req.userId;

    if (!songId) throw new ValidationError({ song_id: 'Not validation' });

    const song = await SongModel.findOne({
      where: {
        ownerId: userId,
        id: songId,
      },
    });

    if (song === null) throw new NotfoundError({ song: 'User not own this song' });

    await song.destroy();
    return response.status(200).json({
      isSuccess: true,
      message: 'Delete song successfully',
    });
  }

  // GET /song/search?value=tenbaihat

  async SearchSong(req, response) {
    const value = req.query.value;
    if (!value || value.trim() === '') throw new ValidationError({ value: 'Not validation' });

    var songs = await SongModel.findAll({
        where: {
          name: { [Op.like]: `%${value}%` },
        },
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
          {
            model: GenreModel,
            attributes: {
              exclude: ['updateAt', 'createAt'],
            },
          },
        ],
        attributes: {
          exclude: ['genreId', 'ownerId'],
        },
        limit: 20,
      }),
      songs = multiSqlizeToJSON(songs);

    songs = songs.map((song) => {
      song.owner = song.user;
      delete song.user;
      return song;
    });

    var playlists = await PlayListModel.findAll({
        where: {
          name: { [Op.like]: [`%${value}%`] },
        },
      }),
      playlists = multiSqlizeToJSON(playlists);

    const playlistIds = playlists.map((playlist) => playlist.id);

    var songsOfPlaylist = await SongPlaylistModel.findAll({
      where: {
        playlistId: playlistIds,
      },
      include: {
        model: SongModel,
        as: 'song',
        attributes: {
          exclude: ['genreId', 'ownerId'],
        },
        include: {
          model: GenreModel,
          attributes: {
            exclude: ['updateAt', 'createAt'],
          },
        },
      },
      limit: 20,
    });

    songsOfPlaylist = multiSqlizeToJSON(songsOfPlaylist);

    songsOfPlaylist = songsOfPlaylist.map((song) => {
      var playlistId = song.playlistId;
      song = song.song;
      song.playlistId = playlistId;
      song.owner = song.user;
      delete song.user;
      return song;
    });

    playlists = playlists.map((playlist) => {
      playlist.songs = songsOfPlaylist.filter((song) => song.playlistId === playlist.id);

      return playlist;
    });

    return response.status(200).json({ songs, playlists });
  }

  // Recomend những bài hát chưa được Like (req,response)
  async RecommendSongs(req, response) {
    const userId = req.userId;

    var songs = await SongModel.findAll({
        order: [
          ['numberOfListen', 'DESC'],
          ['createAt', 'DESC'],
        ],
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
          {
            model: GenreModel,
          },
        ],
        limit: 20,
      }),
      songs = multiSqlizeToJSON(songs);

    const ownerIds = songs.map((song) => song.user.id);

    var followed = []; // những người sở hữu bài hát mà được user follow
    if (userId) {
      followed = await FollowUserModel.findAll({
        where: {
          followed: ownerIds,
          user_id: userId,
        },
      });
      followed = multiSqlizeToJSON(followed);
    }

    if (!userId) {
      songs = songs.map((song) => {
        song.isLiked = false;
        song.owner = song.user;
        song.owner.isFollowed = false;
        delete song.user;

        return song;
      });

      return response.status(200).json({ data: songs });
    }

    const songIds = songs.map((song) => song.id);

    var userLikedSong = await UserLikeSongModel.findAll({
        where: {
          songId: songIds,
          userId: userId,
        },
      }),
      userLikedSong = multiSqlizeToJSON(userLikedSong);

    songs = songs.map((song) => {
      song.isLiked = userLikedSong.find((liked) => liked.songId === song.id) ? true : false;
      song.owner = song.user;
      delete song.user;

      song.owner.isFollowed = followed.find((follow) => follow.followed === song.owner.id)
        ? true
        : false;
      return song;
    });

    return response.status(200).json({ data: songs });
  }

  async getSongsLiked(req, response) {
    const userId = req.userId;

    var likes = await UserLikeSongModel.findAll({
        where: {
          userId: userId,
        },
        include: {
          model: SongModel,
          as: 'songOfUserLike',
          include: {
            model: UserModel,
            attributes: {
              exclude: ['password'],
            },
          },
        },
        order: [['createAt', 'DESC']],
      }),
      likes = multiSqlizeToJSON(likes);

    var ownerIds = likes.map((like) => like.songOfUserLike.ownerId);
    ownerIds = ownerIds.filter((item, index) => ownerIds.indexOf(item) === index);

    var userfollows = await FollowUserModel.findAll({
        where: {
          followed: ownerIds,
        },
      }),
      userfollows = multiSqlizeToJSON(userfollows);

    const songIds = likes.map((like) => like.songId);
    var userLikedSongs = await UserLikeSongModel.findAll({
        where: {
          songId: songIds,
        },
      }),
      userLikedSongs = multiSqlizeToJSON(userLikedSongs);

    likes = likes.map((song) => {
      song.songOfUserLike.owner = song.songOfUserLike.user;
      delete song.songOfUserLike.user;

      song.song = song.songOfUserLike;
      delete song.songOfUserLike;

      song.song.likeCount = userLikedSongs.filter((like) => like.songId === song.songId).length;
      song.song.isLiked = true;

      song.song.owner.followerCount = userfollows.filter(
        (follow) => follow.followed === song.song.ownerId,
      ).length;
      return song;
    });

    return response.status(200).json({ data: likes });
  }
}

module.exports = new SongController();
