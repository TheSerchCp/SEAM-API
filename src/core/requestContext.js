const { AsyncLocalStorage } = require('async_hooks');

/**
 * requestContext.js
 * Almacenamiento por request usando AsyncLocalStorage de Node.js.
 * Propaga automáticamente a través de toda la cadena async/await sin pasar
 * el contexto como parámetro en cada función.
 *
 * Store shape: { userId, socketId, currentOperation }
 *   userId           — idUser del token JWT (null si ruta pública)
 *   socketId         — ID del socket del cliente (desde header X-Socket-ID)
 *   currentOperation — última operación emitida con emitStart (para emitError)
 */
const storage = new AsyncLocalStorage();

module.exports = {
  /** Ejecuta fn dentro de un contexto con el store dado */
  run: (store, fn) => storage.run(store, fn),

  /** Retorna el store del request actual, o null si no hay contexto */
  getStore: () => storage.getStore() ?? null,
};
