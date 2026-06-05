/**
 * Envía una respuesta de éxito estandarizada.
 * Los errores son manejados exclusivamente por error.middleware.js.
 *
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
const success = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = { success };
