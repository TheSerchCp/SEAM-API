

const BaseRepository = require('../../core/BaseRepository');

/**
 * SidebarRepository
 * Maneja las consultas a BD para gestión de sidebar items y su asignación a roles.
 * Tablas: sidebarItems, roleXItem
 */
class SidebarRepository extends BaseRepository {
  constructor() {
    super('sidebarItems', 'idItem');
  }

  /** Inserta un nuevo item en sidebarItems sin asignarlo a ningún rol */
  async createItem(data, connection = null) {
    const result = await this.query(
      `INSERT INTO sidebarItems (nameItem, iconItem, route) VALUES (?, ?, ?)`,
      [data.nameItem, data.iconItem ?? null, data.route ?? null],
      connection,
    );
    return { idItem: result.insertId, ...data };
  }

  /** Actualiza los campos de un sidebarItem (parcial) */
  async updateItem(idItem, data, connection = null) {
    const result = await this.query(
      `UPDATE sidebarItems SET ? WHERE idItem = ?`,
      [data, idItem],
      connection,
    );
    return result.affectedRows > 0;
  }

  /**
   * Elimina un sidebarItem.
   * FK ON DELETE CASCADE en roleXItem elimina automáticamente las asignaciones.
   */
  async removeItem(idItem, connection = null) {
    const result = await this.query(
      `DELETE FROM sidebarItems WHERE idItem = ?`,
      [idItem],
      connection,
    );
    return result.affectedRows > 0;
  }

  /** Busca un sidebarItem por PK para validar existencia */
  async findItemById(idItem, connection = null) {
    const rows = await this.query(
      `SELECT * FROM sidebarItems WHERE idItem = ? LIMIT 1`,
      [idItem],
      connection,
    );
    return rows[0] || null;
  }

  /**
   * Asigna un sidebarItem existente a un rol en roleXItem.
   * Retorna false si la combinación ya existe (sin lanzar error).
   */
  async assignItemToRole(roleId, idItem, connection = null) {
    const existing = await this.query(
      `SELECT 1 FROM roleXItem WHERE roleId = ? AND itemId = ? LIMIT 1`,
      [roleId, idItem],
      connection,
    );
    if (existing.length > 0) return false;

    await this.query(
      `INSERT INTO roleXItem (roleId, itemId) VALUES (?, ?)`,
      [roleId, idItem],
      connection,
    );
    return true;
  }

  /** Busca un rol por PK para validar existencia */
  async findRoleById(idRole, connection = null) {
    const rows = await this.query(
      `SELECT * FROM roles WHERE idRole = ? LIMIT 1`,
      [idRole],
      connection,
    );
    return rows[0] || null;
  }
}

module.exports = new SidebarRepository();
