const sidebarService = require('./sidebar.service');
const { success } = require('../../core/helpers/ApiResponse');

/** POST /api/v1/sidebar */
const addSidebarItem = async (req, res, next) => {
  try {
    const item = await sidebarService.addSidebarItem(req.body);
    success(res, item, 'Sidebar item creado exitosamente', 201);
  } catch (err) { next(err); }
};

/** PUT /api/v1/sidebar/:idItem */
const editSidebarItem = async (req, res, next) => {
  try {
    const item = await sidebarService.editSidebarItem(Number(req.params.idItem), req.body);
    success(res, item, 'Sidebar item actualizado exitosamente');
  } catch (err) { next(err); }
};

/** DELETE /api/v1/sidebar/:idItem */
const deleteSidebarItem = async (req, res, next) => {
  try {
    await sidebarService.deleteSidebarItem(Number(req.params.idItem));
    success(res, null, 'Sidebar item eliminado exitosamente');
  } catch (err) { next(err); }
};

/** POST /api/v1/sidebar/:idItem/role/:idRole */
const addItemToRole = async (req, res, next) => {
  try {
    const result = await sidebarService.addItemToRole(
      Number(req.params.idRole),
      Number(req.params.idItem),
    );
    success(res, result, 'Item asignado al rol exitosamente', 201);
  } catch (err) { next(err); }
};

module.exports = { addSidebarItem, editSidebarItem, deleteSidebarItem, addItemToRole };
