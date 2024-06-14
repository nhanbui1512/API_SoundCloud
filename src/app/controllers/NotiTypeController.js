const { NotiTypeModel } = require('../models');

class NotiTypeController {
  async createNotiType(req, responses) {
    const newNotiType = await NotiTypeModel.create({ typeName: req.body.name });
    return responses.status(200).json({ status: 'success', data: newNotiType });
  }
}
module.exports = new NotiTypeController();
