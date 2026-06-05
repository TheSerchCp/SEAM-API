const { Router } = require('express');
const permissionController = require('./permission.controller');
const auth     = require('../../middleware/auth.middleware');
const roles    = require('../../middleware/roles.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

const registerSchema = {
  nameUri:     { required: true, type: 'string', minLength: 2, maxLength: 100 },
  description: { required: true, type: 'string' },
};

const getByRoleIdSchema = {
  roleId: { required: true, type: 'string', pattern: /^\d+$/ },
};

const getByNameUriSchema = {
  nameUri: { required: true, type: 'string', minLength: 2, maxLength: 100 },
};

const idSchema = {
  id: { required: true, type: 'string', pattern: /^\d+$/ },
};

const assignSchema = {
  roleId:       { required: true, type: 'number' },
  permissionId: { required: true, type: 'number' },
};

// GET  /api/v1/permission                   → todos los permisos (solo auth, sin roles check)
// POST /api/v1/permission/register          → registrar permiso
// GET  /api/v1/permission/getByRoleId       → permisos de un rol (solo auth)
// GET  /api/v1/permission/getByNameUri      → permiso por nameUri (solo auth)
// DELETE /api/v1/permission/:id             → eliminar permiso
// POST /api/v1/permission/assign            → asignar permiso a rol
// DELETE /api/v1/permission/unassign        → quitar permiso de rol

router.get(   '/',            auth,        permissionController.findAllPermissions);
router.post(  '/register',    auth, roles, validate(registerSchema),                  permissionController.registerPermission);
router.get(   '/getByRoleId', auth,        validate(getByRoleIdSchema, 'query'),      permissionController.findPermissionByRoleId);
router.get(   '/getByNameUri',auth,        validate(getByNameUriSchema,'query'),      permissionController.findPermissionByNameUri);
router.post(  '/assign',      auth, roles, validate(assignSchema),                    permissionController.assignPermissionToRole);
router.delete('/unassign',    auth, roles, validate(assignSchema),                    permissionController.removePermissionFromRole);
router.delete('/:id',         auth, roles, validate(idSchema, 'params'),              permissionController.deletePermission);

module.exports = router;
