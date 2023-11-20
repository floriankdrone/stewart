require('dotenv').config();
const express = require('express');
const pgp = require('pg-promise')(/* options */);
const bodyParser = require('body-parser');
const winston = require('winston');

const controller = require('./controller');

const app = express();

const { PORT, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } =
  process.env;
const port = PORT || 3000;

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});
app.set('logger', logger);

const db = pgp(
  `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
);
app.set('db', db);

app.use(bodyParser.json());

app.use('/', controller);

app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});
