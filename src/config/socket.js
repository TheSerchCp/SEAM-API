/**
 * SocketService — singleton que encapsula la instancia de Socket.IO.
 * Usar socketService.emit() en lugar de global.io para evitar estado global mutable.
 * Para despliegues multi-instancia agregar el adaptador de Redis:
 *   io.adapter(require('socket.io-redis')({ host, port }))
 */
class SocketService {
  constructor() {
    this._io = null;
  }

  init(io) {
    this._io = io;
  }

  get io() {
    if (!this._io) throw new Error('SocketService no inicializado. Llama a init(io) primero.');
    return this._io;
  }

  /** Emitir a todos los clientes conectados */
  emit(event, data) {
    this.io.emit(event, data);
  }

  /** Emitir a una sala específica */
  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  /** Emitir a un socket específico */
  emitToSocket(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }

  /** Emitir a la sala privada de un usuario */
  emitToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

module.exports = new SocketService();

