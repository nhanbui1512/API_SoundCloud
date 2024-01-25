const { UserModel } = require('../models');

class HomeController {
  async index(req, res) {
    const users = await UserModel.findAll();
    console.log(users);

    return res.send('Home Router');
  }
}
module.exports = new HomeController();
