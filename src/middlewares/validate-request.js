// Ensures the request body contains the given fields before reaching the controller.
function requireBodyFields(fields) {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = fields.filter((field) => body[field] === undefined);

    if (missing.length > 0) {
      const err = new Error(`Missing required fields: ${missing.join(', ')}`);
      err.statusCode = 400;
      return next(err);
    }

    next();
  };
}

module.exports = { requireBodyFields };
