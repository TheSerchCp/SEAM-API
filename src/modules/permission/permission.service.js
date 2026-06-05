const permissionRepository = require('./permission.repository');
const { emitStart, emitProcessing, emitSuccess } = require('../../core/helpers/socketEvents');
const { ConflictError, NotFoundError } = require('../../core/errors/HttpErrors');

const registerPermission = async ({ nameUri, description }) => {
  emitStart('permissions:create', 'Iniciando registro de permiso...');

  emitProcessing('permissions:create', 'Verificando disponibilidad del permiso...');
  const existing = await permissionRepository.findPermissionByNameUri(nameUri);
  if (existing.length > 0) throw new ConflictError('El permiso ya se encuentra registrado.');

  emitProcessing('permissions:create', 'Guardando permiso...');
  const permission = await permissionRepository.create({ nameUri, description });

  emitSuccess('permissions:create', `Permiso '${nameUri}' registrado exitosamente`, permission);
  return permission;
};

const findAllPermissions = async () => {
  emitStart('permissions:fetchAll', 'Consultando permisos...');
  const permissions = await permissionRepository.findAllPermissions();
  emitSuccess('permissions:fetchAll', 'Permisos obtenidos', { count: permissions.length });
  return permissions;
};

const findPermissionByRoleId = async ({ roleId }) => {
  emitStart('permissions:fetchByRole', `Consultando permisos del rol ${roleId}...`);
  const permissions = await permissionRepository.findPermissionsByIdRole(roleId);
  emitSuccess('permissions:fetchByRole', `Permisos del rol ${roleId} obtenidos`, { roleId, count: permissions.length });
  return permissions;
};

const findPermissionByNameUri = async ({ nameUri }) => {
  emitStart('permissions:fetchByUri', `Buscando permiso '${nameUri}'...`);
  const permission = await permissionRepository.findPermissionByNameUri(nameUri);
  if (!permission || permission.length === 0) throw new NotFoundError(`El permiso '${nameUri}' no existe.`);
  emitSuccess('permissions:fetchByUri', `Permiso '${nameUri}' encontrado`, permission);
  return permission;
};

const deletePermission = async (id) => {
  emitStart('permissions:delete', `Eliminando permiso ${id}...`);
  const deleted = await permissionRepository.deleteWithRelations(id);
  if (!deleted) throw new NotFoundError(`Permiso con id ${id} no encontrado`);
  emitSuccess('permissions:delete', `Permiso ${id} eliminado`);
};

const assignPermissionToRole = async ({ roleId, permissionId }) => {
  emitStart('permissions:assign', `Asignando permiso ${permissionId} al rol ${roleId}...`);
  await permissionRepository.assignToRole(roleId, permissionId);
  emitSuccess('permissions:assign', `Permiso asignado al rol`);
};

const removePermissionFromRole = async ({ roleId, permissionId }) => {
  emitStart('permissions:unassign', `Quitando permiso ${permissionId} del rol ${roleId}...`);
  await permissionRepository.removeFromRole(roleId, permissionId);
  emitSuccess('permissions:unassign', `Permiso quitado del rol`);
};

module.exports = {
  registerPermission,
  findAllPermissions,
  findPermissionByRoleId,
  findPermissionByNameUri,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
};
