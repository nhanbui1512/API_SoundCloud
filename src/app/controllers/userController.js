const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require('http-status-codes');

const { UserModel, SongModel, FollowUserModel, sequelize } = require('../models');
const userRepository = require('../Repositories/userRepository');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

const { isValidEmail } = require('../until/email');
const { checkPass } = require('../until/checkPass');
const { SqlizeToJSON, multiSqlizeToJSON } = require('../until/sequelize');
const pagination = require('../until/paginations');
const ConfligError = require('../errors/ConfligError');

class UserController {
  // POST    /user/register
  async registerUser(req, response, next) {
    const data = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
    };

    if (!isValidEmail(data.email)) throw new ValidationError({ email: 'Not validation' });

    const validatePassword = checkPass(data.password);
    if (!validatePassword) throw new ValidationError({ password: 'Not validation' });

    const user = await userRepository.findOneByProps({ email: data.email });
    if (user) throw new ConfligError({ email: 'Email is exist' });

    const cryptPassword = await bcrypt.hash(data.password, 10);

    var newUser = await userRepository.create({
      userName: data.userName,
      email: data.email,
      password: cryptPassword,
      roleId: 2,
    });

    newUser = newUser.toJSON();
    newUser.password = data.password;

    return response.status(200).json({
      isSuccess: true,
      newUser,
    });
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

    await userRepository.update(userId, updateData);
    var newData = await userRepository.findById(userId);
    delete newData.songs;

    return response.status(200).json({ isSuccess: true, data: newData });
  }

  // PUT  /user/change-password
  async changePassWord(req, response, next) {
    const userId = req.userId;
    const oldPass = req.body.oldPassword;
    const newPass = req.body.newPassWord;

    const user = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (user === null) throw new NotFoundError({ message: 'Not found user' });
    // kiểm tra mật khẩu cũ có đúng không
    let isEqual = await bcrypt.compare(oldPass, user.password);
    if (!isEqual) throw new NotFoundError({ user: 'Old Password is wrong' });

    //kiểm tra chuẩn mật khẩu
    const checkpass = checkPass(newPass);
    if (!checkpass) throw new ValidationError({ newPassword: 'Not validaiton' });

    const cryptPassword = await bcrypt.hash(newPass, 10);
    user.password = cryptPassword;

    var newUser = await user.save();
    newUser = newUser.toJSON();
    newUser.password = newPass;

    return response.status(200).json({
      message: 'User was update pass successfully',
      data: { newUser },
    });
  }

  // GET  /user/get-profile
  async getMyProfile(req, response, next) {
    const userId = req.userId;
    const user = await userRepository.findById(userId, userId);
    return response.status(200).json({ data: user });
  }

  // GET  /user?user_id=2
  async findUser(req, response, next) {
    const userIdFind = Number(req.query.user_id);
    const userId = req.userId || null;

    if (!userIdFind) throw new ValidationError({ user_id: 'Not validation' });
    const user = await userRepository.findById(userIdFind, userId);
    if (user === null) throw new NotFoundError({ message: 'Not found user' });

    return response.status(200).json({ data: user });
  }

  // GET   /user/search?value=timkiemuser
  async searchUser(req, response) {
    const userId = req.userId || null;

    const value = req.query.value;
    if (!value || value.trim() === '') throw new ValidationError({ value: 'Not validation' });

    const condition = {
      [Op.or]: [
        { email: { [Op.like]: `%${value}%` } },
        {
          userName: {
            [Op.like]: `%${value}%`,
          },
        },
      ],
    };

    var users = await userRepository.findAllByProps(condition, {
      exclude: ['password', 'refreshToken'],
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
  async getAll(req, response) {
    const userId = req.userId;

    const page = Number(req.query.page) || 1;
    var perPage = Number(req.query.per_page) || 5;
    const offset = (page - 1) * perPage; // Tính OFFSET
    const { count, rows } = await userRepository.findAll(perPage, offset, userId);
    const pageData = pagination({ page, perPage, count });

    return response.status(StatusCodes.OK).json({ ...pageData, data: rows });
  }

  async deleteUser(req, response) {
    const { id } = req.params;
    var alterRows = await userRepository.deleteById(id);
    return response.status(200).json({ alterRows });
  }
}

module.exports = new UserController();
