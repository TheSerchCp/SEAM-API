const userService = require('./user.service');
const { success } = require('../../core/helpers/ApiResponse');

/**
 * user.controller.js
 * Capa delgada entre las rutas HTTP y user.service.
 * Extrae los datos del request, llama al servicio y formatea la respuesta.
 * No contiene lógica de negocio ni queries a BD.
 */

/**
 * GET /api/v1/users
 * Retorna la lista paginada de usuarios.
 * Acepta query params: ?page=1&limit=20
 * page y limit se parsean a número; si no vienen se usan los defaults del servicio.
 */
const findAllUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const users = await userService.findAllUsers({ page, limit });
    success(res, users, 'Usuarios obtenidos exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/:id
 * Retorna un usuario específico por su idUser.
 * Si no existe, el servicio lanza NotFoundError → error.middleware retorna 404.
 */
const getByIdUser = async (req, res, next) => {
  try {
    const user = await userService.getByIdUser(Number(req.params.id));
    success(res, user, 'Usuario obtenido exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/users/:id
 * Actualiza los datos de un usuario (full_name, email, roleId).
 * El body ya fue validado por validate.middleware antes de llegar aquí.
 * La contraseña no puede modificarse desde este endpoint.
 */
const editUser = async (req, res, next) => {
  try {
    const user = await userService.editUser(Number(req.params.id), req.body);
    success(res, user, 'Usuario actualizado exitosamente');
  } catch (err) {
    next(err);
  }
};


const enableDisabledUser = async (req, res, next) => {
  try{
    const user = await userService.enableDisableUserById(req.params.id,req.body);
    const {isActive} = req.body;
    success(res,user,'Usuario actualizado exitosamente');
  }catch(err){
    next(err);
  }
}

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(Number(req.params.id));
    success(res, null, 'Usuario eliminado exitosamente');
  } catch (err) { next(err); }
};

module.exports = { findAllUsers, getByIdUser, editUser, deleteUser,enableDisabledUser };
