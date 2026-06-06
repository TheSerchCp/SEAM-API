const AppError = require('../core/errors/AppError');
const { NotFoundError } = require('../core/errors/HttpErrors');
const { emitError } = require('../core/helpers/socketEvents');
const requestContext = require('../core/requestContext');

/**
 * error.middleware.js
 * Centraliza el manejo de todos los errores de la aplicación en un solo lugar.
 * Exporta dos middlewares que deben registrarse AL FINAL de app.js,
 * después de todas las rutas.
 */

/**
 * Mapa de códigos de error MySQL a respuestas HTTP legibles.
 * Evita que errores internos de la BD lleguen sin tratar al cliente.
 *
 * ER_DUP_ENTRY       → email/campo único duplicado → 409 Conflict
 * ER_NO_REFERENCED_ROW_2 → FK a registro inexistente → 400 Bad Request
 * ER_ROW_IS_REFERENCED_2 → no se puede borrar, tiene hijos → 409 Conflict
 */
const MYSQL_ERROR_MAP = {
  ER_DUP_ENTRY:           { status: 409, message: 'El registro ya existe (valor duplicado)' },
  ER_NO_REFERENCED_ROW_2: { status: 400, message: 'Referencia a un registro inexistente' },
  ER_ROW_IS_REFERENCED_2: { status: 409, message: 'No se puede eliminar: existen registros relacionados' },
};

/**
 * notFoundHandler
 * Captura cualquier request a una ruta que no existe.
 * Express lo invoca cuando ninguna ruta anterior coincidió con el request.
 * Debe registrarse DESPUÉS de todas las rutas y ANTES de errorHandler.
 */
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`));
};

/**
 * errorHandler
 * Manejador global de errores de Express (4 parámetros: err, req, res, next).
 * Express detecta que es un error handler por la firma de 4 argumentos.
 * Todos los errores lanzados con next(err) llegan aquí.
 *
 * Jerarquía de manejo:
 * 1. Errores de MySQL (ER_DUP_ENTRY, etc.) → mapeados a HTTP con mensaje claro
 * 2. AppError operacional (isOperational=true) → usa su statusCode y mensaje
 * 3. Error inesperado (bug, falla de red, etc.) → 500 sin exponer detalles
 *
 * Debe registrarse como el ÚLTIMO middleware en app.js.
 */
const errorHandler = (err, req, res, next) => {
  // Emitir evento de error al cliente solicitante para ocultar el loader
  const store = requestContext.getStore();
  if (store?.currentOperation) {
    // Sanitizar: solo exponer mensajes de errores operacionales conocidos
    const safeMsg =
      (err instanceof AppError && err.isOperational)
        ? err.message
        : (err.code && MYSQL_ERROR_MAP[err.code])
          ? MYSQL_ERROR_MAP[err.code].message
          : 'Error interno del servidor';
    emitError(store.currentOperation, safeMsg);
  }

  // Caso 1: Error conocido de MySQL → devuelve mensaje HTTP apropiado
  if (err.code && MYSQL_ERROR_MAP[err.code]) {
    const { status, message } = MYSQL_ERROR_MAP[err.code];
    return res.status(status).json({ success: false, message });
  }

  // Caso 2: Error operacional controlado (BadRequestError, NotFoundError, etc.)
  // isOperational=true indica que fue lanzado intencionalmente por la app
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Caso 3: Error inesperado (bug en código, falla externa, etc.)
  // Se loguea internamente pero NO se expone al cliente por seguridad
  console.error('[ERROR NO CONTROLADO]', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};

module.exports = { notFoundHandler, errorHandler };

