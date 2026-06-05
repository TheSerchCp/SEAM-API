const { BadRequestError } = require('../core/errors/HttpErrors');

/**
 * validate.middleware.js
 * Valida los datos del request contra un esquema definido por el desarrollador.
 * Es una función de orden superior (factory): recibe el esquema y la fuente,
 * retorna el middleware que ejecuta las validaciones.
 *
 * Si hay errores → lanza BadRequestError (400) con todos los errores en un mensaje.
 * Si todo es válido → llama next() y el request llega limpio al controlador.
 *
 * Reglas soportadas por campo:
 *   required  : boolean  - el campo debe estar presente y no vacío
 *   type      : string   - tipo JS: 'string', 'number', 'boolean'
 *   minLength : number   - largo mínimo del string
 *   maxLength : number   - largo máximo del string
 *   min       : number   - valor numérico mínimo
 *   max       : number   - valor numérico máximo
 *   pattern   : RegExp   - el valor debe coincidir con la expresión regular
 *
 * ℹ️ Para validaciones avanzadas (objetos anidados, arrays, enums, sanitización)
 * considera reemplazar con Zod o Joi.
 *
 * @param {Object}                    schema - Reglas por campo
 * @param {'body'|'params'|'query'}   source - De dónde leer los datos (default: 'body')
 *
 * Uso:
 *   const validate = require('../middleware/validate.middleware');
 *   const schema = {
 *     email:    { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *     password: { required: true, type: 'string', minLength: 6 },
 *   };
 *   router.post('/login', validate(schema), controller.login);
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const data = req[source] || {}; // Extrae body, params o query según `source`
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const isEmpty = value === undefined || value === null || value === '';

    // Primero: verifica si el campo requerido está ausente
    if (rules.required && isEmpty) {
      errors.push(`'${field}' es requerido`);
      continue; // No seguir validando este campo si está vacío
    }

    if (isEmpty) continue; // Campo opcional ausente → sin validación adicional

    // Verifica que el tipo JS del valor coincida con el esperado
    if (rules.type && typeof value !== rules.type) {
      errors.push(`'${field}' debe ser de tipo ${rules.type}`);
      continue;
    }

    // Validaciones de longitud para strings
    if (rules.minLength !== undefined && String(value).length < rules.minLength) {
      errors.push(`'${field}' debe tener al menos ${rules.minLength} caracteres`);
    }
    if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
      errors.push(`'${field}' no debe exceder ${rules.maxLength} caracteres`);
    }

    // Validaciones de rango para números
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`'${field}' debe ser mayor o igual a ${rules.min}`);
    }
    if (rules.max !== undefined && Number(value) > rules.max) {
      errors.push(`'${field}' debe ser menor o igual a ${rules.max}`);
    }

    // Validación de formato con expresión regular (email, teléfono, etc.)
    if (rules.pattern && !rules.pattern.test(String(value))) {
      errors.push(`'${field}' tiene un formato inválido`);
    }
  }

  // Si hay al menos un error → rechaza el request antes de llegar al controlador
  if (errors.length > 0) {
    return next(new BadRequestError(errors.join('. ')));
  }

  next();
};

module.exports = validate;

