const rolesService = require('./roles.service');
const { success } = require('../../core/helpers/ApiResponse');

/** GET /api/v1/roles — Lista todos los roles (sin paginación, para selects de formularios) */
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await rolesService.getAllRoles();
    success(res, roles, 'Roles obtenidos');
  } catch (err) { next(err); }
};

/** POST /api/v1/roles */
const addRole = async (req, res, next) => {
  try {
    const role = await rolesService.addRole(req.body);
    success(res, role, 'Rol creado exitosamente', 201);
  } catch (err) { next(err); }
};

/** PUT /api/v1/roles/:idRole */
const editRole = async (req, res, next) => {
  try {
    const role = await rolesService.editRole(Number(req.params.idRole), req.body);
    success(res, role, 'Rol actualizado exitosamente');
  } catch (err) { next(err); }
};

/** DELETE /api/v1/roles/:idRole */
const deleteRole = async (req, res, next) => {
  try {
    await rolesService.deleteRole(Number(req.params.idRole));
    success(res, null, 'Rol eliminado exitosamente');
  } catch (err) { next(err); }
};

module.exports = { getAllRoles, addRole, editRole, deleteRole };
