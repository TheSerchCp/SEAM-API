const BaseRepository = require('../../core/BaseRepository');

/**
 * RolesRepository
 * Maneja las consultas a BD exclusivamente para gestión de roles.
 * Tabla: roles
 */
class RolesRepository extends BaseRepository {
  constructor() {
    super('roles', 'idRole');
  }

  /** Busca un rol por nombre para verificar duplicados */
  async findByName(roleName, connection = null) {
    const rows = await this.query(
      `SELECT * FROM roles WHERE LOWER(roleName) = LOWER(?) LIMIT 1`,
      [roleName],
      connection,
    );
    return rows[0] || null;
  }
}

module.exports = new RolesRepository();
