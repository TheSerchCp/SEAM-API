const { Router } = require('express');
const sidebarController = require('./sidebar.controller');
const auth     = require('../../middleware/auth.middleware');
const roles    = require('../../middleware/roles.middleware');
const validate = require('../../middleware/validate.middleware');

const router = Router();

const idItemSchema = {
  idItem: { required: true, type: 'string', pattern: /^\d+$/ },
};

const dualParamSchema = {
  idItem: { required: true, type: 'string', pattern: /^\d+$/ },
  idRole: { required: true, type: 'string', pattern: /^\d+$/ },
};

const addItemSchema = {
  nameItem: { required: true,  type: 'string', minLength: 1, maxLength: 100 },
  iconItem: { required: false, type: 'string', maxLength: 50 },
  route:    { required: false, type: 'string', maxLength: 100 },
};

const editItemSchema = {
  nameItem: { required: false, type: 'string', minLength: 1, maxLength: 100 },
  iconItem: { required: false, type: 'string', maxLength: 50 },
  route:    { required: false, type: 'string', maxLength: 100 },
};

// nameUri generado automáticamente por roles.middleware:
//   POST   /api/v1/sidebar
//   PUT    /api/v1/sidebar/:idItem
//   DELETE /api/v1/sidebar/:idItem
//   POST   /api/v1/sidebar/:idItem/role/:idRole

router.post(  '/',                       auth, roles, validate(addItemSchema),                            sidebarController.addSidebarItem);
router.put(   '/:idItem',                auth, roles, validate(idItemSchema,   'params'), validate(editItemSchema), sidebarController.editSidebarItem);
router.delete('/:idItem',                auth, roles, validate(idItemSchema,   'params'),                 sidebarController.deleteSidebarItem);
router.post(  '/:idItem/role/:idRole',   auth, roles, validate(dualParamSchema,'params'),                 sidebarController.addItemToRole);

module.exports = router;
