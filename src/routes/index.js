const { Router } = require('express');
const authRoutes       = require('../modules/auth/auth.routes');
const permissionRoutes = require('../modules/permission/permission.routes');
const userRoutes       = require('../modules/users/user.routes');
const rolesRoutes      = require('../modules/roles/roles.routes');
const sidebarRoutes    = require('../modules/sidebar/sidebar.routes');

const router = Router();

router.use('/auth',       authRoutes);
router.use('/permission', permissionRoutes);
router.use('/users',      userRoutes);
router.use('/roles',      rolesRoutes);
router.use('/sidebar',    sidebarRoutes);

module.exports = router;


