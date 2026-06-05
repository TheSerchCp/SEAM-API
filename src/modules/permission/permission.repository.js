const BaseRepository = require('../../core/BaseRepository');


class PermissionRepository extends BaseRepository{
    constructor(){
        super("permissions","idPermission")
    }


    async findAllPermissions(connection = null){
        return this.query(
            `
            SELECT p.idPermission, p.nameUri, p.description
                FROM permissions p
            ORDER BY p.idPermission`,
            connection
        )
    }

    async findPermissionsByIdRole(roleId, connection = null) {
        return this.query(
            `
            SELECT p.idPermission, p.nameUri, p.description
            FROM permissions p
            INNER JOIN permissionXRole pr ON p.idPermission = pr.permissionId
            WHERE pr.roleId = ?
            ORDER BY p.idPermission
            `,
            [roleId],
            connection,
        )
    }

    async findPermissionByNameUri(nameUri,connection = null){
                return this.query(
            `
            SELECT p.idPermission, p.nameUri, p.description
            FROM permissions p
            WHERE lower(p.nameUri) = lower(?)
            ORDER BY p.idPermission
            `,
            [nameUri],
            connection,
        )
    }

    /**
     * Asigna un permiso a un rol en la tabla pivote `permissionXRole`.
     * Ignora duplicados (INSERT IGNORE).
     */
    async assignToRole(roleId, permissionId, connection = null) {
        return this.query(
            `INSERT IGNORE INTO permissionXRole (roleId, permissionId) VALUES (?, ?)`,
            [roleId, permissionId],
            connection,
        );
    }

    /**
     * Elimina la asignación de un permiso a un rol.
     */
    async removeFromRole(roleId, permissionId, connection = null) {
        return this.query(
            `DELETE FROM permissionXRole WHERE roleId = ? AND permissionId = ?`,
            [roleId, permissionId],
            connection,
        );
    }

    /**
     * Elimina un permiso y todas sus asignaciones en una transacción.
     */
    async deleteWithRelations(idPermission) {
        return this.transaction(async (conn) => {
            await this.query(
                `DELETE FROM permissionXRole WHERE permissionId = ?`,
                [idPermission],
                conn,
            );
            const result = await this.query(
                `DELETE FROM permissions WHERE idPermission = ?`,
                [idPermission],
                conn,
            );
            return result.affectedRows > 0;
        });
    }
}

module.exports = new PermissionRepository();