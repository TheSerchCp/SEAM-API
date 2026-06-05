const authService = require('./auth.service');
const { success } = require('../../core/helpers/ApiResponse');

/**
 * auth.controller.js
 * Capa delgada entre las rutas HTTP y la lógica de negocio (auth.service).
 * Responsabilidades: extraer datos del request, llamar al servicio,
 * formatear la respuesta exitosa o pasar el error al error handler.
 *
 * El controller NO contiene lógica de negocio ni queries a BD,
 * solo orquesta el flujo HTTP ↔ servicio.
 */

/**
 * POST /api/v1/auth/register
 * Registra un nuevo usuario. El body ya fue validado por validate.middleware.
 * En caso de error (email duplicado, etc.) next(err) lo envía al error.middleware.
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    success(res, user, 'Usuario registrado exitosamente', 201); // 201 Created
  } catch (err) {
    next(err); // Pasa el error al errorHandler global
  }
};

/**
 * POST /api/v1/auth/login
 * Autentica al usuario y retorna JWT + sidebar + permissions.
 * El frontend debe guardar el token y usarlo en el header Authorization.
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    success(res, result, 'Login exitoso'); // 200 OK
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };

