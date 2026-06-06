const requestContext = require('../core/requestContext');

/**
 * context.middleware.js
 * Inicializa el store de AsyncLocalStorage para cada request.
 * Debe registrarse globalmente en app.js antes de las rutas.
 *
 * Extrae el X-Socket-ID del header (enviado por ApiClient del frontend)
 * para poder emitir eventos de progreso al socket exacto que inició la
 * operación, en lugar de a todos los sockets del usuario.
 *
 * El userId se establece después por auth.middleware cuando se verifica el JWT.
 */
module.exports = (req, res, next) => {
  const socketId = req.headers['x-socket-id'] ?? null;
  requestContext.run({ userId: null, socketId, currentOperation: null }, next);
};
