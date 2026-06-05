const socketService = require('../../config/socket');

/**
 * socketEvents.js
 * Helper centralizado para emitir progreso de operaciones en tiempo real.
 * Todos los eventos se emiten bajo el nombre 'operation:progress' con un payload
 * estandarizado que incluye el status, permitiendo al frontend manejar un loader
 * unificado sin necesidad de escuchar múltiples eventos.
 *
 * Ciclo de vida de una operación:
 *   emitStart()      → status: 'start'      (operación iniciada, mostrar loader)
 *   emitProcessing() → status: 'processing' (paso intermedio, actualizar mensaje)
 *   emitSuccess()    → status: 'success'    (completada, ocultar loader, actualizar UI)
 *   emitError()      → status: 'error'      (fallida, ocultar loader, mostrar error)
 *
 * Payload estándar:
 * {
 *   operation : 'users:updated',          // identificador de la operación
 *   status    : 'start|processing|success|error',
 *   message   : 'Verificando usuario...', // mensaje legible para el loader
 *   data      : null | result,            // datos del resultado (solo en success)
 *   timestamp : '2026-06-04T...'
 * }
 *
 * Frontend (escucha un solo evento):
 *   socket.on('operation:progress', ({ operation, status, message, data }) => {
 *     if (status === 'start' || status === 'processing') showLoader(message);
 *     if (status === 'success') { hideLoader(); updateUI(data); }
 *     if (status === 'error')   { hideLoader(); showError(message); }
 *   });
 */

const emit = (operation, status, message, data = null) => {
  try {
    socketService.emit('operation:progress', {
      operation,
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch {
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

