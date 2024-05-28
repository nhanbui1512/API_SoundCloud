const { UserModel, SongModel, FollowUserModel, sequelize, GenreModel } = require('../models');
const UserRepository = require('../Repositories/userRepository');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const { isValidEmail } = require('../until/email');
const { checkPass } = require('../until/checkPass');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const cloudinary = require('cloudinary').v2;

class UserController {
  // POST    /user/register
  async registerUser(req, response, next) {
    const data = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
    };

    if (!data.userName || !data.email || !data.password) {
      throw new ValidationError({
        message: 'The data is not filled',
      });
    }

    if (!isValidEmail(data.email))
      throw new ValidationError({
        email: 'Email not validation',
      });

    const checkpass = await checkPass(data.password);
    if (checkpass) {
      const user = await UserModel.findOne({
        where: {
          email: data.email,
        },
      });

      if (user) {
        throw new ValidationError({ email: 'Email is exist' });
      } else {
        const cryptPassword = await bcrypt.hash(data.password, 10);

        var newUser = await UserModel.create({
          userName: data.userName,
          email: data.email,
          password: cryptPassword,
        });

        newUser = newUser.toJSON();
        newUser.password = data.password;

        return response.status(200).json({
          isSuccess: true,
          newUser,
        });
      }
    } else {
      return response.status(422).json({
        isSuccess: false,
        message: 'Password not validation',
      });
    }
  }

  // PUT  /user/update
  async updateUser(req, response, next) {
    const file = req.file;
    if (file && file.mimetype.includes('image') === false)
      throw ValidationError({ file: 'File not validation' });

    const userId = req.userId;

    var updateData = { ...req.body };

    if (Object.keys(updateData).length === 0) {
      return response.status(200).json({ status: 'successs' });
    }

    if (file) {
      // Các tùy chọn chuyển đổi ảnh và tải lên
      const uploadOptions = {
        transformation: {
          width: 400, // Chiều rộng mới
          height: 400, // Chiều cao mới
          crop: 'fill', // Phương pháp cắt ảnh
          format: 'jpg', // Định dạng mới
        },
        folder: 'avatars', // Thư mục trên Cloudinary để lưu ảnh
        resource_type: 'auto',
      };
      const uploaded = await cloudinary.uploader.upload(file.path, uploadOptions);
      updateData.avatar = uploaded.url;
    }

    await UserRepository.update(userId, updateData);
    var newData = await UserRepository.findById(userId);
    delete newData.songs;

    return response.status(200).json({ isSuccess: true, data: newData });
  }

  // PUT  /user/change-password
  async changePassWord(req, response, next) {
    const userId = req.userId;
    const ownPass = req.body.ownPassWord;
    const newPass = req.body.newPassWord;
    const confirmPass = req.body.confirmPassWord;
    if (!ownPass || !newPass || !confirmPass) {
      return response.status(400).json({
        result: false,
        message: 'Must be filled out completely',
      });
    }
    if (newPass != confirmPass) {
      return response.status(400).json({
        result: false,
        message: 'Pass new and comfirm is not alike',
      });
    } else {
      const user = await UserModel.findOne({
        where: {
          id: userId,
        },
      });

      if (user !== null) {
        // kiểm tra mật khẩu cũ có đúng không
        let isEqual = await bcrypt.compare(ownPass, user.password);

        if (!isEqual) throw new NotFoundError({ user: 'Old Password is wrong' });

        const checkpass = await checkPass(newPass);

        //kiểm tra chuẩn mật khẩu
        if (checkpass) {
          const cryptPassword = await bcrypt.hash(newPass, 10);
          user.password = cryptPassword;

          var newUser = await user.save();
          newUser = newUser.toJSON();
          newUser.password = newPass;
          return response.status(200).json({
            result: true,
            data: { newUser },
            message: 'User was update pass successfully',
          });
        } else {
          // không chuẩn
          return response.status(422).json({
            result: false,
            message: 'Password unsuccessful',
          });
        }
      } else {
        throw new NotFoundError({ user: 'Not found User' });
      }
    }
  }

  // GET  /user/get-profile
  async getMyProfile(req, response, next) {
    const userId = req.userId;
    const user = await UserRepository.findById(userId, null);
    return response.status(200).json({ data: user });
  }

  // GET  /user?user_id=2
  async findUser(req, response, next) {
    const userIdFind = Number(req.query.user_id);
    const userId = req.userId || null;

    if (!userIdFind) throw new ValidationError({ user_id: 'Not validation' });
    const user = await UserRepository.findById(userIdFind, userId);
    if (user === null) throw new NotFoundError({ message: 'Not found user' });

    return response.status(200).json({ data: user });
  }

  // GET   /user/search?value=timkiemuser
  async searchUser(req, response) {
    const userId = req.userId || null;

    const value = req.query.value;
    if (!value || value.trim() === '') throw new ValidationError({ value: 'Not validation' });

    var users = await UserModel.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${value}%` } },
          {
            userName: {
              [Op.like]: `%${value}%`,
            },
          },
        ],
      },
      include: [{ model: SongModel }],
      attributes: {
        exclude: 'password',
      },
    });

    const userIds = users.map((user) => user.id);

    var followers = await FollowUserModel.findAll({
      where: {
        followed: userIds,
      },
    });

    followers = multiSqlizeToJSON(followers);

    users = users.map((user) => {
      user = SqlizeToJSON(user);
      user.track = user.songs.length;

      user.followerCount = followers.reduce((total, follow) => {
        if (follow.followed === user.id) return total + 1;
        else return total;
      }, 0);

      user.isFollowed = followers.find((follow) => (follow.user_id = userId)) ? true : false;

      return user;
    });

    return response.status(200).json({ data: users });
  }

  // GET /user
  async getListUser(req, response) {
    const userId = req.userId;
    var quantity = Number(req.query.quantity);
    if (!quantity) throw new ValidationError({ quantity: 'Not validation' });

    if (quantity > 50) quantity = 50;

    var users = await UserModel.findAll({
        include: [
          {
            model: SongModel,
          },
        ],
        attributes: {
          exclude: ['password'],
        },
        limit: quantity,
        order: sequelize.random(),
      }),
      users = multiSqlizeToJSON(users);

    const user_ids = users.map((user) => user.id);

    var followers = await FollowUserModel.findAll({
        where: {
          followed: user_ids,
        },
      }),
      followers = multiSqlizeToJSON(followers);

    users = users.map((user) => {
      user.trackNumber = user.songs.length;
      user.followerNumber = followers.filter((follower) => follower.followed === user.id).length;
      user.isFollowed = followers.find(
        (follower) => follower.user_id === userId && follower.followed === user.id,
      )
        ? true
        : false;
      return user;
    });

    return response.status(200).json({ data: users });
  }

  async getTopSong(req, response) {
    const userId = req.userId;

    var topUsersWithSongs = await UserModel.findAll({
      include: [{ model: SongModel, order: [['createAt', 'DESC']] }],
      attributes: {
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM songs WHERE songs.ownerId = users.id)'),
            'songsCount',
          ],
        ],
        exclude: ['password'],
      },
      order: [['songsCount', 'DESC']],
    });

    topUsersWithSongs = multiSqlizeToJSON(topUsersWithSongs);

    topUsersWithSongs = topUsersWithSongs.map((user) => {
      user.isFollowed = false;
      return user;
    });

    topUsersWithSongs = topUsersWithSongs.splice(0, 10);

    if (userId) {
      const ownerIds = topUsersWithSongs.map((user) => user.id);

      var followers = await FollowUserModel.findAll({
          where: {
            followed: ownerIds,
          },
        }),
        followers = multiSqlizeToJSON(followers);

      topUsersWithSongs = topUsersWithSongs.map((user) => {
        user.isFollowed = followers.find((follower) => follower.user_id === userId) ? true : false;
        user.followerCount = followers.filter((follow) => follow.followed === user.id).length;
        return user;
      });
    }

    return response.status(200).json({ data: topUsersWithSongs });
  }
}

module.exports = new UserController();
