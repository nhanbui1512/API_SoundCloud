const { UserModel } = require('../models');

class HomeController {
  async index(req, res) {
    const users = await UserModel.findAll();

    return res.status(200).json({
      data: users,
    });
  }
}
module.exports = new HomeController();
