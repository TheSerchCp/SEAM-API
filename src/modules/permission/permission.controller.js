const permissionService = require('./permission.service');
const { success } = require('../../core/helpers/ApiResponse');

const registerPermission = async(req, res, next) => {
    try{
        const permission = await permissionService.registerPermission(req.body);
        success(res,permission,'Permiso registrado exitosamente',201);
    }catch(err){
        next(err);
    }
}

const findAllPermissions = async(req,res,next) =>{
    try{
        const permissions = await permissionService.findAllPermissions();
        success(res,permissions,'Permisos registados obtenidos');
    }catch(err){
        next(err);
    }
}

/** Bug fix: los datos llegan por query string en GET, no por body */
const findPermissionByRoleId = async(req,res,next) => {
    try{
        const roleId = Number(req.query.roleId);
        const permission = await permissionService.findPermissionByRoleId({ roleId });
        success(res,permission,'Permiso obtenido por rol.');
    }catch(err){
        next(err);
    }
}

const findPermissionByNameUri = async(req, res, next) => {
    try{
        const permission = await permissionService.findPermissionByNameUri(req.query);
        success(res,permission,'Permiso obtenido por nombre.');
    }catch(err){
        next(err);
    }
}

const deletePermission = async(req, res, next) => {
    try{
        await permissionService.deletePermission(Number(req.params.id));
        success(res, null, 'Permiso eliminado exitosamente');
    }catch(err){
        next(err);
    }
}

const assignPermissionToRole = async(req, res, next) => {
    try{
        await permissionService.assignPermissionToRole(req.body);
        success(res, null, 'Permiso asignado al rol exitosamente');
    }catch(err){
        next(err);
    }
}

const removePermissionFromRole = async(req, res, next) => {
    try{
        await permissionService.removePermissionFromRole(req.body);
        success(res, null, 'Permiso removido del rol exitosamente');
    }catch(err){
        next(err);
    }
}

module.exports = {
    registerPermission,
    findAllPermissions,
    findPermissionByRoleId,
    findPermissionByNameUri,
    deletePermission,
    assignPermissionToRole,
    removePermissionFromRole,
}