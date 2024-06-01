const NotFoundError = require('../errors/NotFoundError');
const { RoleModel } = require('../models');

class RoleRepository {
  async findById(id) {
    return await RoleModel.findByPk(id);
  }

  async findByName(name) {
    return await RoleModel.findAll({
      where: {
        name: name,
      },
    });
  }
  async create(roleName) {
    const newRole = await RoleModel.create({
      name: roleName,
    });
    return newRole;
  }

  async update(name, id) {
    const role = await RoleModel.findByPk(id);
    if (role === null) throw new NotFoundError({ message: 'Not found role' });
    role.name = name;
    role.updateAt = new Date();
    await role.save();
    return role;
  }
}

module.exports = new RoleRepository();
