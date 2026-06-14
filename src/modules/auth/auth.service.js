const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT } = require('../../config/env');
const authRepository = require('./auth.repository');
const { emitStart, emitProcessing, emitSuccess } = require('../../core/helpers/socketEvents');
const { ConflictError, UnauthorizedError,InactiveError } = require('../../core/errors/HttpErrors');

const SALT_ROUNDS = 12;

const register = async ({ full_name, email, password, roleId }) => {
  emitStart('auth:register', 'Iniciando registro de usuario...');

  emitProcessing('auth:register', 'Verificando disponibilidad del correo...');
  const existing = await authRepository.findOne('email', email);
  if (existing) throw new ConflictError('El correo ya está registrado');

  emitProcessing('auth:register', 'Procesando contraseña...');
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  emitProcessing('auth:register', 'Guardando usuario...');
  const user = await authRepository.create({ full_name, email, password: hashedPassword, roleId: roleId ?? null });

  const { password: _, ...userData } = user;
  emitSuccess('auth:register', 'Usuario registrado exitosamente', userData);
  return userData;
};

const login = async ({ email, password }) => {
  emitStart('auth:login', 'Iniciando autenticación...');

  emitProcessing('auth:login', 'Verificando credenciales...');
  const user = await authRepository.findByEmailWithRole(email);

  if(!user) throw new UnauthorizedError("Usuario no encontrado");

  if(user.isActive === 0) throw new InactiveError('Usuario inactivo, contactate con el administrador');

  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !valid) throw new UnauthorizedError('Credenciales inválidas');

  emitProcessing('auth:login', 'Cargando permisos y menú...');
  const [sidebarItems, permissions] = await Promise.all([
    authRepository.getSidebarItems(user.roleId),
    authRepository.getPermissions(user.roleId),
  ]);

  emitProcessing('auth:login', 'Generando token de sesión...');
  const payload = { idUser: user.idUser, email: user.email, roleId: user.roleId, roleName: user.roleName };
  const token = jwt.sign(payload, JWT.secret, { expiresIn: JWT.expiresIn });

  const { password: _, ...userData } = user;
  const result = { token, expiresIn: JWT.expiresIn, user: userData, sidebarItems, permissions: permissions.map(p => p.nameUri) };

  emitSuccess('auth:login', 'Sesión iniciada exitosamente', { idUser: userData.idUser, email: userData.email });
  return result;
};

module.exports = { register, login };
