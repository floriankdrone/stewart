require('dotenv').config();
const express = require('express');
const pgp = require('pg-promise')(/* options */);
const bodyParser = require('body-parser');
const winston = require('winston');

const controller = require('./controller');
const getConfig = require('./config');

const app = express();

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});
app.set('logger', logger);

const { PORT, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } =
  getConfig(logger);

const db = pgp(
  `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
);
app.set('db', db);

app.use(bodyParser.json());

app.use('/', controller);

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});
