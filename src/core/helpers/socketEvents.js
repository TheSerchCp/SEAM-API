const socketService = require('../../config/socket');
const requestContext = require('../requestContext');

/**
 * socketEvents.js
 * Helper centralizado para emitir progreso de operaciones en tiempo real.
 *
 * Emite DOS tipos de eventos:
 *
 * 1. 'operation:progress' → solo al socket/usuario que inició la operación.
 *    Controla el loader y notificaciones del cliente solicitante.
 *    Payload: { operation, status, message, data, timestamp }
 *
 * 2. 'data:changed' → broadcast a todos los clientes conectados (solo en success).
 *    Permite que otras pestañas/usuarios actualicen sus tablas en tiempo real.
 *    Solo se emite en operaciones de mutación (create/update/delete/assign).
 *    Payload: { operation, data }
 *
 * Ciclo de vida de una operación:
 *   emitStart()      → status: 'start'      (operación iniciada, mostrar loader)
 *   emitProcessing() → status: 'processing' (paso intermedio, actualizar mensaje)
 *   emitSuccess()    → status: 'success'    (completada, ocultar loader, actualizar UI)
 *   emitError()      → status: 'error'      (fallida, ocultar loader, mostrar error)
 *
 * Frontend:
 *   socket.on('operation:progress', ({ operation, status, message, data }) => { ... })
 *   socket.on('data:changed',       ({ operation, data })                   => { ... })
 */

// Sufijos que identifican operaciones de mutación (vs. lecturas)
const FETCH_SUFFIXES = [':fetchAll', ':fetchOne', ':fetchByRole', ':fetchByUri'];
const FETCH_OPS      = ['auth:login'];

const isMutation = (op) =>
  !FETCH_SUFFIXES.some(s => op.endsWith(s)) &&
  !FETCH_OPS.includes(op);

const emit = (operation, status, message, data = null) => {
  try {
    const store = requestContext.getStore();
    const payload = {
      operation,
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Guardar la operación actual en el store para que error.middleware
    // pueda emitir el evento de error con el nombre correcto.
    if (store && status === 'start') {
      store.currentOperation = operation;
    }

    // Emitir 'operation:progress' solo al cliente que inició la operación
    if (store?.socketId) {
      // Más preciso: al socket exacto (tab específico del usuario)
      socketService.emitToSocket(store.socketId, 'operation:progress', payload);
    } else if (store?.userId) {
      // Fallback: a todos los sockets del usuario (por si no se envió X-Socket-ID)
      socketService.emitToUser(store.userId, 'operation:progress', payload);
    }
    // Sin contexto (ruta pública como auth:login/register) → no emitir progress

    // Emitir 'data:changed' a todos los clientes para mutaciones exitosas.
    // Se incluye initiatorSocketId para que el cliente que inició la acción
    // pueda ignorar la notificación (ya conoce el resultado por la respuesta HTTP).
    if (status === 'success' && isMutation(operation)) {
      console.log(`📡 [socketEvents] Emitiendo data:changed para "${operation}" a TODOS los clientes`);
      socketService.emit('data:changed', {
        operation,
        message,
        data,
        initiatorSocketId: store?.socketId ?? null,
      });
    }
  } catch (err) {
    console.error('❌ [socketEvents] Error al emitir evento:', err.message);
    // Si el socket no está inicializado (tests, CLI) no bloquea la operación
  }
};

/** Emite el inicio de una operación → el frontend muestra el loader */
const emitStart = (operation, message) => emit(operation, 'start', message);

/** Emite un paso intermedio → el frontend actualiza el mensaje del loader */
const emitProcessing = (operation, message) => emit(operation, 'processing', message);

/** Emite la finalización exitosa → el frontend oculta el loader y actualiza la UI */
const emitSuccess = (operation, message, data = null) => emit(operation, 'success', message, data);

/** Emite un error → el frontend oculta el loader y muestra el error */
const emitError = (operation, message) => emit(operation, 'error', message);

module.exports = { emitStart, emitProcessing, emitSuccess, emitError };

