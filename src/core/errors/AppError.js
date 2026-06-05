class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {boolean} isOperational - true para errores esperados/controlados
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
