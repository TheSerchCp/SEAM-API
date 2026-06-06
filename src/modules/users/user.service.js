const bcrypt = require('bcrypt');
const userRepository = require('./user.repository');
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

const deleteUser = async (id) => {
  emitStart('users:delete', `Eliminando usuario ${id}...`);
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
  await userRepository.delete(id);
  emitSuccess('users:delete', `Usuario ${user?.full_name} eliminado`);
};

module.exports = { findAllUsers, getByIdUser, editUser, deleteUser };
