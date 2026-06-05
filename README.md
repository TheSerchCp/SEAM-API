# SEAM API

REST API construida con **Node.js**, **Express** y **MySQL**. Incluye autenticación JWT, control de roles y permisos, y soporte para eventos en tiempo real con **Socket.IO**.

## Tecnologías

- Node.js + Express 5
- MySQL (mysql2)
- JWT (jsonwebtoken) + bcrypt
- Socket.IO
- dotenv

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_db
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173
```

## Scripts

```bash
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

## Endpoints

Base URL: `http://localhost:{PORT}/api/v1`

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |

### Usuarios *(requiere auth + rol)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:id` | Obtener usuario por ID |
| PUT | `/users/:id` | Editar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Roles *(requiere auth)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/roles` | Listar roles |
| POST | `/roles` | Crear rol |
| PUT | `/roles/:idRole` | Editar rol |
| DELETE | `/roles/:idRole` | Eliminar rol |

### Permisos *(requiere auth)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/permission` | Listar permisos |
| POST | `/permission/register` | Registrar permiso |
| GET | `/permission/getByRoleId?roleId=` | Permisos por rol |
| GET | `/permission/getByNameUri?nameUri=` | Permiso por URI |
| POST | `/permission/assign` | Asignar permiso a rol |
| DELETE | `/permission/unassign` | Quitar permiso de rol |
| DELETE | `/permission/:id` | Eliminar permiso |

### Sidebar *(requiere auth)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/sidebar` | Obtener sidebar según rol del usuario |

## Autenticación

Incluye el token en el header de cada petición protegida:

```
Authorization: Bearer <token>
```

## Socket.IO

La conexión requiere un token JWT válido:

```js
const socket = io('http://localhost:{PORT}', {
  auth: { token: '<jwt_token>' }
});
```
