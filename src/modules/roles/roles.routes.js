const { Router } = require('express');
const rolesController = require('./roles.controller');
const auth     = require('../../middleware/auth.middleware');
const roles    = require('../../middleware/roles.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

const idRoleSchema = { idRole: { required: true, type: 'string', pattern: /^\d+$/ } };

const addRoleSchema = {
  roleName:    { required: true,  type: 'string', minLength: 2, maxLength: 50 },
  description: { required: false, type: 'string' },
};

const editRoleSchema = {
  roleName:    { required: false, type: 'string', minLength: 2, maxLength: 50 },
  description: { required: false, type: 'string' },
};

// GET  /api/v1/roles  — solo requiere auth (usado en formularios por cualquier usuario autenticado)
router.get(   '/',         auth,        rolesController.getAllRoles);
router.post(  '/',         auth, roles, validate(addRoleSchema),                              rolesController.addRole);
router.put(   '/:idRole',  auth, roles, validate(idRoleSchema, 'params'), validate(editRoleSchema), rolesController.editRole);
router.delete('/:idRole',  auth, roles, validate(idRoleSchema, 'params'),                     rolesController.deleteRole);

module.exports = router;
