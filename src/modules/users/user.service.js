const bcrypt = require('bcrypt');
const userRepository = require('./user.repository');
const roleRespository = require('../roles/roles.repository')
const { emitStart, emitProcessing, emitSuccess } = require('../../core/helpers/socketEvents');
const { NotFoundError, ConflictError } = require('../../core/errors/HttpErrors');

const SALT_ROUNDS = 12;

const findAllUsers = async ({ page = 1, limit = 50 } = {}) => {
  emitStart('users:fetchAll', 'Consultando usuarios...');
  const offset = (page - 1) * limit;
  const users = await userRepository.findAll({ limit, offset });
  emitSuccess('users:fetchAll', 'Usuarios obtenidos', { count: users.length, page, limit });
  return users;
};

const getByIdUser = async (id) => {
  emitStart('users:fetchOne', `Buscando usuario ${id}...`);
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
  emitSuccess('users:fetchOne', `Usuario ${user?.full_name} encontrado`, { idUser: user.idUser });
  return user;
};

const editUser = async (id, data) => {
  emitStart('users:update', `Iniciando actualización del usuario ${id}...`);

  emitProcessing('users:update', 'Verificando existencia del usuario...');
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado`);

  if (data.email && data.email !== user.email) {
    emitProcessing('users:update', 'Verificando disponibilidad del correo...');
    const emailInUse = await userRepository.findOne('email', data.email);
    if (emailInUse) throw new ConflictError('El correo ya está en uso por otro usuario');
  }

  if (data.password) {
    emitProcessing('users:update', 'Procesando nueva contraseña...');
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const { idUser, ...safeData } = data;

  emitProcessing('users:update', 'Guardando cambios...');
  await userRepository.update(id, safeData);
  const updated = await userRepository.findById(id);

  emitSuccess('users:update', `Usuario ${updated?.full_name} actualizado exitosamente`, updated);
  return updated;
};

const enableDisableUserById = async (id,data) => {
  const {isActive} = data;
  emitStart('users:update', `Iniciando ${isActive === 1 ? 'activacion' : 'desactivación'} del usuario ${id}...`);

  emitProcessing('users:update', 'Verificando existencia del usuario...');
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado`);

  emitProcessing('users:update', 'Guardando cambios...');
  await userRepository.update(id, data);
  const updated = await userRepository.findById(id);
  emitSuccess('users:update', `Usuario ${updated?.full_name} ${isActive === 1 ? 'activado' : 'desactivado'} exitosamente`, updated);
  return updated;
}

const deleteUser = async (id) => {
  emitStart('users:delete', `Eliminando usuario ${id}...`);
  
  const user = await userRepository.findById(id);
  emitProcessing('users:update', 'Verificando existencia del usuario...');
  if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
  await userRepository.delete(id);
  emitSuccess('users:delete', `Usuario ${user?.full_name} eliminado`);
};

const resetPassword = async(id) => {
  emitStart('users:update', `Modificando usuario ${id}...`);
  const user = await userRepository.findOne(id);
  emitProcessing('users:update', 'Verificando existencia del usuario...');
  if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
  emitProcessing('users:update', 'Verificando existencia del rol de usuario...');

  //Hashear la nueva contraseña que sera user + 123
  let newPass = ('user') + '123';
  newPass = await bcrypt.hash(newPass,SALT_ROUNDS);
  await userRepository.resetPassword(id,newPass);
  emitSuccess('users:update', `Contraseña reestablecida a usuario${user?.full_name} `);
}

module.exports = { findAllUsers, getByIdUser, editUser, deleteUser,enableDisableUserById,resetPassword };

