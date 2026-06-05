const { Router } = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');

const router = Router();

const registerSchema = {
  full_name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  email:     { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password:  { required: true, type: 'string', minLength: 6, maxLength: 100 },
  roleId:    { required: true, type: 'number' },
};

const loginSchema = {
  email:    { required: true, type: 'string' },
  password: { required: true, type: 'string' },
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);

module.exports = router;

