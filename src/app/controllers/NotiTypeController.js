const ConfligError = require('../errors/ConfligError');
const NotFoundError = require('../errors/NotFoundError');
const { NotiTypeModel } = require('../models');

class NotiTypeController {
  async getAll(req, responses) {
    const data = await NotiTypeModel.findAll();
    return responses.status(200).json({ data });
  }

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
    const result = await NotiTypeModel.destroy({
      where: {
        id: id,
      },
    });

    if (result === 0) throw new NotFoundError({ message: 'Not found notification type' });
    return responses.status(200).json({ status: 'Success' });
  }
}
module.exports = new NotiTypeController();
