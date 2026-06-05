const express = require('express');
const cors = require('cors');
const { CORS_ORIGIN } = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1', routes);

// 404 y manejador de errores global — deben ir al final
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
