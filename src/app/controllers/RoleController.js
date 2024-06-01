const { StatusCodes } = require('http-status-codes');
const roleRepository = require('../Repositories/roleRepository');

class RoleController {
  async createRole(req, res) {
    const roleName = req.body.name;
    const isExist = await roleRepository.findByName(roleName);
    if (isExist.length > 0)
      return res.status(StatusCodes.CONFLICT).json({ message: 'Role name is existed' });
    const newRole = await roleRepository.create(roleName);
    return res.status(StatusCodes.OK).json({ data: newRole });
  }

  async updateRole(req, responses) {
    const roleName = req.body.name;
    const id = req.params.id;
    const newData = await roleRepository.update(roleName, id);
    return responses.status(200).json({ status: 'success', newData });
  }
}
module.exports = new RoleController();
