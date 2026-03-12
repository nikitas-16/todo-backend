/**
 * Express middleware factory for Joi schema validation.
 * Validates req.body against the provided schema.
 * Returns 400 with error details on validation failure.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema.
 * @returns {Function} Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res
      .status(400)
      .json({ error: 'Validation failed', details: messages });
  }
  return next();
};

/**
 * Express middleware factory for Joi query parameter validation.
 * Validates req.query against the provided schema.
 * Returns 400 with error details on validation failure.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema.
 * @returns {Function} Express middleware function.
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res
      .status(400)
      .json({ error: 'Validation failed', details: messages });
  }
  return next();
};

export { validateQuery };
export default validate;
