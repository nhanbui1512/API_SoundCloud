const { UserModel } = require('../models');

class HomeController {
  async index(req, res) {
    const users = await UserModel.findAll({
      attributes: {
        exclude: ['password'],
      },
    });

    return res.status(200).json({
      data: users,
    });
  }
}
module.exports = new HomeController();
