const { Router } = require('express');
const userController = require('./user.controller');
const auth     = require('../../middleware/auth.middleware');
const roles    = require('../../middleware/roles.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

const editUserSchema = {
  full_name: { required: false, type: 'string', minLength: 2,  maxLength: 100 },
  email:     { required: false, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  roleId:    { required: false, type: 'number' },
  password:  { required: false, type: 'string', minLength: 6,  maxLength: 100 },
};

const enableDisableUserSchema = {
  isActive:    { required: true, type: 'number' },
};

const getByIdSchema = {
  id: { required: true, type: 'string', pattern: /^\d+$/ },
};

router.get(   '/',    auth, roles, userController.findAllUsers);
router.get(   '/:id', auth, roles, validate(getByIdSchema, 'params'), userController.getByIdUser);
router.put(   '/:id', auth, roles, validate(getByIdSchema, 'params'), validate(editUserSchema), userController.editUser);
router.put(   '/:id/state',auth, roles,validate(enableDisableUserSchema),userController.enableDisabledUser)
router.delete('/:id', auth, roles, validate(getByIdSchema, 'params'), userController.deleteUser);

module.exports = router;
