function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(statusCode).json({ error: err.message });
}

module.exports = { notFound, errorHandler };
