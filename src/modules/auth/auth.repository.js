const BaseRepository = require('../../core/BaseRepository');

/**
 * AuthRepository
 * Maneja todas las consultas a BD relacionadas con autenticación.
 * Extiende BaseRepository para heredar CRUD genérico y agrega
 * queries específicas que involucran JOINs con otras tablas.
 */
class AuthRepository extends BaseRepository {
  constructor() {
    // 'users' = nombre de la tabla, 'idUser' = nombre de la PK
    super('users', 'idUser');
  }

  /**
   * Busca un usuario por email incluyendo el nombre de su rol en una sola query.
   * El JOIN evita hacer dos consultas separadas (primero user, luego role).
   * LEFT JOIN garantiza que si el usuario no tiene rol asignado, igual se retorna.
   * Retorna null si el email no existe (usado en login para evitar error 500).
   *
   * @param {string} email
   */
  async findByEmailWithRole(email, connection = null) {
    const rows = await this.query(
      `SELECT u.idUser, u.full_name, u.email, u.password, u.roleId,
              r.roleName, CAST(u.isActive AS SIGNED) AS isActive
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.idRole
       WHERE u.email = ?
       LIMIT 1`,
      [email],
      connection,
    );
    return rows[0] || null;
  }

  /**
   * Retorna los items de sidebar asignados a un rol específico.
   * La tabla `roleXItem` es la tabla pivote que relaciona roles con items.
   * INNER JOIN descarta items que no estén asignados al rol.
   * El frontend usa estos datos para construir la navegación dinámica
   * (cada rol ve solo las secciones que le corresponden).
   *
   * @param {number} roleId - ID del rol del usuario que hizo login
   */
  async getSidebarItems(roleId, connection = null) {
    return this.query(
      `SELECT s.idItem, s.nameItem, s.iconItem, s.route
       FROM sidebarItems s
       INNER JOIN roleXItem ri ON s.idItem = ri.itemId
       WHERE ri.roleId = ?
       ORDER BY s.idItem`,
      [roleId],
      connection,
    );
  }

  /**
   * Retorna los permisos (nameUri) asignados a un rol específico.
   * La tabla `permissionXRole` es la tabla pivote rol <-> permiso.
   * El frontend usa el array para mostrar/ocultar botones y acciones.
   * El backend puede usarlos en un middleware de permisos más granular que RBAC.
   *
   * @param {number} roleId - ID del rol del usuario que hizo login
   */
  async getPermissions(roleId, connection = null) {
    return this.query(
      `SELECT p.idPermission, p.nameUri, p.description
       FROM permissions p
       INNER JOIN permissionXRole pr ON p.idPermission = pr.permissionId
       WHERE pr.roleId = ?
       ORDER BY p.idPermission`,
      [roleId],
      connection,
    );
  }
}

module.exports = new AuthRepository();
