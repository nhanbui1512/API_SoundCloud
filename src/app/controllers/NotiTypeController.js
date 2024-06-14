const ConfligError = require('../errors/ConfligError');
const { NotiTypeModel } = require('../models');

class NotiTypeController {
  async createNotiType(req, responses) {
    const isExist = await NotiTypeModel.findOne({
      where: {
        typeName: req.body.name,
      },
    });
    if (isExist !== null) throw new ConfligError({ message: 'Notification type is existed' });
    const newNotiType = await NotiTypeModel.create({ typeName: req.body.name });
    return responses.status(200).json({ status: 'success', data: newNotiType });
  }

  async deleteNotitype(req, responses) {
    const { id } = req.params;
    console.log(id);
    return responses.send('ok');
  }
}
module.exports = new NotiTypeController();
