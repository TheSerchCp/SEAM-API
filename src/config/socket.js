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
    console.log(`📡 [socketService.emit] Emitiendo "${event}" a TODOS los clientes`, { 
      clientsCount: this.io.engine.clientsCount 
    });
    this.io.emit(event, data);
  }

  /** Emitir a todos los clientes en una sala (alternativa para broadcast) */
  emitToAll(event, data) {
    console.log(`📡 [socketService.emitToAll] Broadcast "${event}" a TODOS los sockets conectados`);
    this.io.emit(event, data);
  }

  /** Emitir a una sala específica */
  emitToRoom(room, event, data) {
    console.log(`📡 [socketService.emitToRoom] Emitiendo "${event}" a sala: ${room}`);
    this.io.to(room).emit(event, data);
  }

  /** Emitir a un socket específico */
  emitToSocket(socketId, event, data) {
    console.log(`📡 [socketService.emitToSocket] Emitiendo "${event}" a socket: ${socketId}`);
    this.io.to(socketId).emit(event, data);
  }

  /** Emitir a la sala privada de un usuario */
  emitToUser(userId, event, data) {
    console.log(`📡 [socketService.emitToUser] Emitiendo "${event}" a usuario: ${userId}`);
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

module.exports = new SocketService();

