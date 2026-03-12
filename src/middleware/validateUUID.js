/**
 * Express middleware that validates the :id route parameter is a valid UUID.
 * Returns 400 if the ID format is invalid, before any database query.
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUUID = (req, res, next) => {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid UUID format' });
  }
  return next();
};

export default validateUUID;
