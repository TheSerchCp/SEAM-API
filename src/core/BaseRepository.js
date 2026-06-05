const pool = require('../config/db');

/**
 * BaseRepository
 * Clase base para todos los repositorios de la aplicación.
 * Centraliza las operaciones CRUD comunes para evitar repetir SQL en cada módulo.
 *
 * Uso:
 *   class UserRepository extends BaseRepository {
 *     constructor() { super('users', 'idUser'); }
 *   }
 */
class BaseRepository {
  /**
   * @param {string} tableName  - Nombre exacto de la tabla en MySQL
   * @param {string} primaryKey - Nombre de la columna PK (default: 'id')
   */
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.pool = pool; // Pool de conexiones MySQL compartido
  }

  /**
   * Ejecuta cualquier query SQL de forma segura con parámetros preparados.
   * Si se pasa una `connection` (de una transacción), la usa en lugar del pool.
   * Los parámetros `?` en el SQL son reemplazados por los valores de `params`
   * de forma segura por mysql2 (previene SQL injection).
   *
   * @param {string} sql - Query SQL con placeholders `?`
   * @param {Array}  params - Valores que reemplazan los `?`
   * @param {import('mysql2/promise').PoolConnection|null} connection
   * @returns {Promise<Array>} - Filas resultantes
   */
  async query(sql, params = [], connection = null) {
    const conn = connection || this.pool; // Prioriza conexión de transacción si existe
    const [rows] = await conn.query(sql, params); // mysql2 retorna [rows, fields]
    return rows;
  }

  /**
   * Obtiene todos los registros de la tabla.
   * Paginación obligatoria para evitar cargar tablas completas en memoria.
   *
   * @param {{ limit?: number, offset?: number }} options
   *   - limit:  máximo de filas a retornar (default 50)
   *   - offset: desde qué fila empezar (default 0, para página 2: offset=50)
   */
  async findAll({ limit = 50, offset = 0 } = {}, connection = null) {
    return this.query(
      `SELECT * FROM \`${this.tableName}\` LIMIT ? OFFSET ?`,
      [limit, offset],
      connection,
    );
  }

  /**
   * Busca un único registro por su clave primaria.
   * Retorna `null` si no existe (en lugar de lanzar excepción).
   *
   * @param {number|string} id - Valor de la PK
   */
  async findById(id, connection = null) {
    const rows = await this.query(
      `SELECT * FROM \`${this.tableName}\` WHERE \`${this.primaryKey}\` = ? LIMIT 1`,
      [id],
      connection,
    );
    return rows[0] || null; // Retorna el primer resultado o null
  }

  /**
   * Busca un único registro por cualquier campo con valor exacto.
   *
   * ⚠️ SEGURIDAD: el parámetro `field` NUNCA debe venir directo del request
   * (req.body, req.params). Siempre hardcodearlo en la clase hija.
   * El valor `value` sí es seguro porque va como parámetro preparado `?`.
   *
   * @param {string} field - Nombre de la columna (debe ser hardcodeado)
   * @param {*}      value - Valor a buscar
   */
  async findOne(field, value, connection = null) {
    const rows = await this.query(
      `SELECT * FROM \`${this.tableName}\` WHERE \`${field}\` = ? LIMIT 1`,
      [value],
      connection,
    );
    return rows[0] || null;
  }

  /**
   * Inserta un nuevo registro en la tabla.
   * mysql2 con `SET ?` mapea automáticamente las propiedades del objeto
   * a columnas: `{ full_name: 'Ana' }` → `SET \`full_name\` = 'Ana'`
   *
   * @param {Object} data - Objeto con los campos a insertar
   * @returns {Object} - Objeto original más la PK generada por AUTO_INCREMENT
   */
  async create(data, connection = null) {
    const result = await this.query(
      `INSERT INTO \`${this.tableName}\` SET ?`,
      [data],
      connection,
    );
    // result.insertId contiene el valor AUTO_INCREMENT generado por MySQL
    return { [this.primaryKey]: result.insertId, ...data };
  }

  /**
   * Actualiza los campos de un registro existente buscado por PK.
   * Solo actualiza las columnas presentes en `data`, no toca las demás.
   *
   * @param {number|string} id   - PK del registro a actualizar
   * @param {Object}        data - Campos a actualizar (parcial)
   * @returns {boolean} - true si se modificó al menos 1 fila
   */
  async update(id, data, connection = null) {
    const result = await this.query(
      `UPDATE \`${this.tableName}\` SET ? WHERE \`${this.primaryKey}\` = ?`,
      [data, id],
      connection,
    );
    return result.affectedRows > 0; // affectedRows = filas realmente modificadas
  }

  /**
   * Elimina un registro por su PK.
   *
   * @param {number|string} id - PK del registro a eliminar
   * @returns {boolean} - true si se eliminó al menos 1 fila
   */
  async delete(id, connection = null) {
    const result = await this.query(
      `DELETE FROM \`${this.tableName}\` WHERE \`${this.primaryKey}\` = ?`,
      [id],
      connection,
    );
    return result.affectedRows > 0;
  }

  /**
   * Ejecuta múltiples operaciones dentro de una TRANSACCIÓN atómica.
   * Si cualquier operación falla → ROLLBACK automático (ningún cambio persiste).
   * Si todas tienen éxito → COMMIT (todos los cambios se guardan juntos).
   *
   * Se pasa la `connection` de la transacción activa a cada operación
   * para que todas usen la misma conexión y pertenezcan al mismo bloque.
   *
   * @example
   * await userRepo.transaction(async (conn) => {
   *   const user = await userRepo.create({ email }, conn);       // op 1
   *   await profileRepo.create({ userId: user.idUser }, conn);   // op 2
   *   // si op 2 falla, op 1 también se revierte
   * });
   *
   * @param {Function} callback - Función que recibe la conexión activa
   * @returns {Promise<*>} - Valor retornado por el callback
   */
  async transaction(callback) {
    const connection = await this.pool.getConnection(); // Obtiene conexión dedicada del pool
    await connection.beginTransaction();               // Inicia el bloque transaccional
    try {
      const result = await callback(connection);       // Ejecuta todas las operaciones
      await connection.commit();                       // Persiste cambios si todo fue bien
      return result;
    } catch (err) {
      await connection.rollback();                     // Deshace cambios si algo falló
      throw err;                                       // Re-lanza el error para el caller
    } finally {
      connection.release();                            // Devuelve la conexión al pool siempre
    }
  }
}

module.exports = BaseRepository;


