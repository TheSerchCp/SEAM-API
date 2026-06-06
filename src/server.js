require('./config/env'); // Cargar y validar variables de entorno primero

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { PORT, CORS_ORIGIN, JWT: jwtConfig } = require('./config/env');
const app = require('./app');
const socketService = require('./config/socket');
const pool = require('./config/db');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN },
});

socketService.init(io);

// Middleware de autenticación para Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token requerido para conectarse'));

  try {
    socket.user = jwt.verify(token, jwtConfig.secret);
    next();
  } catch {
    next(new Error('Token inválido o expirado'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user?.idUser;
  console.log(`🔌 Cliente conectado: ${socket.id} (userId: ${userId})`);

  // Unir al usuario a su sala privada para emitir eventos dirigidos
  if (!userId) {
    console.warn(`⚠️ Socket ${socket.id} FALLO al conectarse: usuario sin idUser`);
    socket.disconnect(true);
    return;
  }
  
  const roomName = `user:${userId}`;
  socket.join(roomName);
  console.log(`✅ Socket ${socket.id} unido a sala: ${roomName}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('✅ Pool de DB cerrado correctamente.');
    } catch (err) {
      console.error('Error cerrando el pool de DB:', err);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
