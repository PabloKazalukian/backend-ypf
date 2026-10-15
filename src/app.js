const express = require('express');
const wellsRoutes = require('./modules/wells/wells.routes');
const productionsRoutes = require('./modules/productions/productions.routes');
const { notFound, errorHandler } = require('./middlewares/error-handler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/wells', wellsRoutes);
app.use('/api/v1/productions', productionsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
