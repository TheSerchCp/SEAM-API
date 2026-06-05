const pool = require('../config/db');
const { ForbiddenError } = require('../core/errors/HttpErrors');

/**
 * roles.middleware.js
 * Control de acceso basado en permisos consultados desde la BD.
 * No requiere parámetros — deriva el nameUri automáticamente del request.
 *
 * El nameUri se construye como: "METHOD /ruta/con/:params"
 * Ejemplos:
 *   GET  /api/v1/users
 *   GET  /api/v1/users/:id
 *   PUT  /api/v1/users/:id
 *   POST /api/v1/permission/register
 *
 * Este valor debe registrarse como nameUri en la tabla `permissions`
 * y asignarse al rol correspondiente en `permissionXRole`.
 *
 * Flujo:
 * 1. Construye nameUri = req.method + " " + req.baseUrl + req.route.path
 * 2. Consulta BD: ¿el roleId del usuario tiene ese permiso?
 * 3. Si sí → next()
 * 4. Si no → ForbiddenError (403)
 *
 * Uso (sin parámetros, referencia directa):
 *   const auth  = require('../middleware/auth.middleware');
 *   const roles = require('../middleware/roles.middleware');
 *   router.get('/',    auth, roles, controller.findAll);
 *   router.put('/:id', auth, roles, validate(schema, 'params'), controller.edit);
 */
module.exports = async (req, res, next) => {
  try {
    const { roleId } = req.user;

    // req.baseUrl = mount point del router  (ej: /api/v1/users)
    // req.route.path = patrón de la ruta    (ej: /:id  o  /)
    // Si route.path es "/" (ruta raíz) no se concatena para evitar doble slash
    const routePath = req.route.path === '/' ? '' : req.route.path;
    const nameUri = `${req.method} ${req.baseUrl}${routePath}`;
    console.log("uri a buscar permiso: ", nameUri)
    const [rows] = await pool.query(
      `SELECT 1
       FROM permissionXRole pr
       INNER JOIN permissions p ON pr.permissionId = p.idPermission
       WHERE pr.roleId = ?
         AND LOWER(p.nameUri) = LOWER(?)
       LIMIT 1`,
      [roleId, nameUri],
    );

    if (rows.length === 0) {
      return next(new ForbiddenError('No tienes permisos para acceder a este recurso'));
    }

    next();
  } catch (err) {
    next(err);
  }
};
