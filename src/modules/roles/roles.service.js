const rolesRepository = require('./roles.repository');
const { emitStart, emitProcessing, emitSuccess } = require('../../core/helpers/socketEvents');
const { NotFoundError, ConflictError } = require('../../core/errors/HttpErrors');

const getAllRoles = async () => {
  return rolesRepository.findAll({ limit: 200 });
};

const addRole = async (data) => {
  emitStart('roles:create', 'Iniciando creación de rol...');

  emitProcessing('roles:create', 'Verificando nombre de rol disponible...');
  const existing = await rolesRepository.findByName(data.roleName);
  if (existing) throw new ConflictError(`El rol '${data.roleName}' ya existe`);

  emitProcessing('roles:create', 'Guardando rol...');
  const role = await rolesRepository.create({ roleName: data.roleName, description: data.description ?? null });

  emitSuccess('roles:create', `Rol '${role.roleName}' creado exitosamente`, role);
  return role;
};

const editRole = async (idRole, data) => {
  emitStart('roles:update', `Iniciando actualización del rol ${idRole}...`);

  emitProcessing('roles:update', 'Verificando existencia del rol...');
  const role = await rolesRepository.findById(idRole);
  if (!role) throw new NotFoundError(`Rol con id ${idRole} no encontrado`);

  if (data.roleName && data.roleName !== role.roleName) {
    emitProcessing('roles:update', 'Verificando disponibilidad del nombre...');
    const duplicate = await rolesRepository.findByName(data.roleName);
    if (duplicate) throw new ConflictError(`El nombre '${data.roleName}' ya está en uso`);
  }

  const { idRole: _, ...safeData } = data;

  emitProcessing('roles:update', 'Guardando cambios...');
  await rolesRepository.update(idRole, safeData);
  const updated = await rolesRepository.findById(idRole);

  emitSuccess('roles:update', `Rol ${idRole} actualizado exitosamente`, updated);
  return updated;
};

const deleteRole = async (idRole) => {
  emitStart('roles:delete', `Iniciando eliminación del rol ${idRole}...`);

  emitProcessing('roles:delete', 'Verificando existencia del rol...');
  const role = await rolesRepository.findById(idRole);
  if (!role) throw new NotFoundError(`Rol con id ${idRole} no encontrado`);

  emitProcessing('roles:delete', 'Eliminando rol y sus asignaciones...');
  await rolesRepository.delete(idRole);

  emitSuccess('roles:delete', `Rol '${role.roleName}' eliminado exitosamente`, { idRole });
};

module.exports = { getAllRoles, addRole, editRole, deleteRole };
