const BaseRepository = require('../../core/BaseRepository');

/**
 * UserRepository
 * Maneja todas las consultas a BD relacionadas con el módulo de usuarios.
 * Extiende BaseRepository para heredar CRUD genérico y agrega queries
 * específicas que enriquecen los datos con JOINs a otras tablas.
 */
class UserRepository extends BaseRepository {
  constructor() {
    // 'users' = tabla, 'idUser' = PK
    super('users', 'idUser');
  }

  /**
   * Retorna todos los usuarios con su rol asignado, paginados.
   * LEFT JOIN garantiza que usuarios sin rol también aparezcan en el resultado.
   * Se excluye la contraseña desde la query para no exponerla accidentalmente.
   *
   * @param {{ limit?: number, offset?: number }} options
   */
  async findAll({ limit = 50, offset = 0 } = {}, connection = null) {
    return this.query(
      `SELECT u.idUser, u.full_name, u.email, u.roleId,
              r.roleName, r.description AS roleDescription
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.idRole
       ORDER BY u.idUser
       LIMIT ? OFFSET ?`,
      [limit, offset],
      connection,
    );
  }

  /**
   * Busca un usuario por su PK incluyendo el nombre y descripción de su rol.
   * Retorna null si no existe.
   *
   * @param {number} id - idUser
   */
  async findById(id, connection = null) {
    const rows = await this.query(
      `SELECT u.idUser, u.full_name, u.email, u.roleId,
              r.roleName, r.description AS roleDescription
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.idRole
       WHERE u.idUser = ?
       LIMIT 1`,
      [id],
      connection,
    );
    return rows[0] || null;
  }
}

module.exports = new UserRepository();
