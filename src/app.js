import 'dotenv/config';
import express from 'express';
import pgp from 'pg-promise';
import bodyParser from 'body-parser';
import winston from 'winston';

import controller from './controller.js';
import getConfig from './config.js';

const app = express();

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});
app.set('logger', logger);

const { PORT, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } =
  getConfig(logger);

const db = pgp()(
  `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
);
app.set('db', db);

app.use(bodyParser.json());

app.use('/', controller);

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});
