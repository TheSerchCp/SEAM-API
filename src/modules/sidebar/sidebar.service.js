const sidebarRepository = require('./sidebar.repository');
const { emitStart, emitProcessing, emitSuccess } = require('../../core/helpers/socketEvents');
const { NotFoundError, ConflictError } = require('../../core/errors/HttpErrors');

/**
 * addSidebarItem
 * Crea un nuevo item en sidebarItems sin asignarlo a ningún rol.
 * Para asignarlo usa addItemToRole.
 */
const addSidebarItem = async (data) => {
  emitStart('sidebar:create', 'Iniciando creación de sidebar item...');

  emitProcessing('sidebar:create', 'Guardando item...');
  const item = await sidebarRepository.createItem(data);

  emitSuccess('sidebar:create', `Item '${item.nameItem}' creado exitosamente`, item);
  return item;
};

/**
 * editSidebarItem
 * Actualiza los campos de un sidebar item existente (parcial).
 */
const editSidebarItem = async (idItem, data) => {
  emitStart('sidebar:update', `Iniciando actualización del item ${idItem}...`);

  emitProcessing('sidebar:update', 'Verificando existencia del item...');
  const item = await sidebarRepository.findItemById(idItem);
  if (!item) throw new NotFoundError(`Sidebar item con id ${idItem} no encontrado`);

  emitProcessing('sidebar:update', 'Guardando cambios...');
  await sidebarRepository.updateItem(idItem, data);
  const updated = await sidebarRepository.findItemById(idItem);

  emitSuccess('sidebar:update', `Item ${idItem} actualizado exitosamente`, updated);
  return updated;
};

/**
 * deleteSidebarItem
 * Elimina un sidebar item.
 * Las asignaciones en roleXItem se eliminan automáticamente por CASCADE.
 */
const deleteSidebarItem = async (idItem) => {
  emitStart('sidebar:delete', `Iniciando eliminación del item ${idItem}...`);

  emitProcessing('sidebar:delete', 'Verificando existencia del item...');
  const item = await sidebarRepository.findItemById(idItem);
  if (!item) throw new NotFoundError(`Sidebar item con id ${idItem} no encontrado`);

  emitProcessing('sidebar:delete', 'Eliminando item y sus asignaciones...');
  await sidebarRepository.removeItem(idItem);

  emitSuccess('sidebar:delete', `Item '${item.nameItem}' eliminado exitosamente`, { idItem });
};

/**
 * addItemToRole
 * Asigna un sidebar item existente a un rol existente en roleXItem.
 * Lanza ConflictError si la combinación rol-item ya existe.
 */
const addItemToRole = async (idRole, idItem) => {
  emitStart('sidebar:assign', `Asignando item ${idItem} al rol ${idRole}...`);

  emitProcessing('sidebar:assign', 'Verificando rol e item...');
  const role = await sidebarRepository.findRoleById(idRole);
  if (!role) throw new NotFoundError(`Rol con id ${idRole} no encontrado`);

  const item = await sidebarRepository.findItemById(idItem);
  if (!item) throw new NotFoundError(`Sidebar item con id ${idItem} no encontrado`);

  emitProcessing('sidebar:assign', 'Registrando asignación...');
  const assigned = await sidebarRepository.assignItemToRole(idRole, idItem);
  if (!assigned) throw new ConflictError(`El item ya está asignado a este rol`);

  const result = { idRole, idItem, roleName: role.roleName, nameItem: item.nameItem };
  emitSuccess('sidebar:assign', `Item '${item.nameItem}' asignado al rol '${role.roleName}'`, result);
  return result;
};

module.exports = { addSidebarItem, editSidebarItem, deleteSidebarItem, addItemToRole };
