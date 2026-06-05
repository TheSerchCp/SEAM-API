const jwt = require('jsonwebtoken');
const { JWT } = require('../config/env');
const { UnauthorizedError } = require('../core/errors/HttpErrors');

/**
 * auth.middleware.js
 * Protege rutas verificando que el request incluya un JWT válido.
 *
 * Flujo:
 * 1. Extrae el token del header: Authorization: Bearer <token>
 * 2. Si no hay token → lanza UnauthorizedError (401)
 * 3. Verifica la firma y expiración del token con la clave secreta
 * 4. Si es válido → adjunta el payload decodificado en req.user y llama next()
 * 5. Si es inválido o expirado → lanza UnauthorizedError (401)
 *
 * req.user contendrá: { idUser, email, roleId, roleName, iat, exp }
 *
 * Uso:
 *   const auth = require('../middleware/auth.middleware');
 *   router.get('/profile', auth, controller.getProfile);
 */
module.exports = (req, res, next) => {
  // authorization: "Bearer eyJhbGci..." → split(' ')[1] extrae solo el token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new UnauthorizedError('Token requerido'));

  try {
    // jwt.verify lanza excepción si el token está expirado, mal firmado o malformado
    req.user = jwt.verify(token, JWT.secret);
    next(); // Token válido → continúa al siguiente middleware o controlador
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
};

