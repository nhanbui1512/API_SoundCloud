const { UserModel, SongModel, FollowUserModel, sequelize } = require('../models');
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

    const userName = req.body.userName;
    const city = req.body.city;
    const country = req.body.country;
    const bio = req.body.bio;

    const user = await UserModel.findByPk(userId);

    if (userName && userName.trim() !== '') user.userName = userName;
    if (city && city.trim() !== '') user.city = city;
    if (country && country.trim() !== '') user.country = country;
    if (bio && bio.trim() !== '') user.bio = bio;

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
      user.avatar = uploaded.url;
    }

    user.updateAt = new Date();
    await user.save();

    const newData = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });

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
    var user = await UserModel.findByPk(userId, {
      include: [
        {
          model: SongModel,
        },
      ],
      attributes: {
        exclude: ['password'],
      },
    });

    if (user !== null) {
      user = SqlizeToJSON(user);
    }

    var followers = await FollowUserModel.findAll({
      where: {
        [Op.or]: [{ followed: userId }, { user_id: userId }],
      },
    });

    const followingCount = followers.reduce((total, follow) => {
      if (follow.user_id === userId) return total + 1;
      return total;
    }, 0);

    const followerCount = followers.reduce((total, follow) => {
      if (follow.followed === userId) return total + 1;
      return total;
    }, 0);

    user.track = user.songs.length;
    user.followingNumber = followingCount;
    user.followerNumber = followerCount;

    return response.status(200).json({ data: user });
  }

  // GET  /user?user_id=2
  async findUser(req, response, next) {
    const userIdFind = Number(req.query.user_id);
    const userId = req.userId || null;

    if (!userIdFind) throw new ValidationError({ user_id: 'Not validation' });

    var user = await UserModel.findByPk(userIdFind, {
      include: [
        {
          model: SongModel,
        },
      ],

      attributes: {
        exclude: ['password'],
      },
    });
    // parse sequelize object -> JSON
    user = SqlizeToJSON(user);

    if (user !== null) {
      // lấy ra những người đã follow  user
      var follower = await FollowUserModel.findAndCountAll({
        where: {
          followed: userIdFind,
        },
      });

      var following = await FollowUserModel.findAndCountAll({
        where: {
          user_id: userIdFind,
        },
      });

      user.followerNumber = follower.count;
      user.followingNumber = following.count;
      // Nếu người dùng có gửi token lên thì kiểm tra xem đã follow user tìm kiếm hay chưa

      follower = multiSqlizeToJSON(follower.rows);
      const isFollowed = follower.find((follower) => follower.user_id === userId);
      user.isFollowed = isFollowed ? true : false;
    }

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

      user.isFollowed = followers.find((follower) => follower.user_id === userId) ? true : false;
      return user;
    });

    return response.status(200).json({ data: users });
  }
}

module.exports = new UserController();
