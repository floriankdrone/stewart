require('dotenv').config();
const express = require('express');
const pgp = require('pg-promise')(/* options */);
const bodyParser = require('body-parser');

const controller = require('./controller');

const app = express();

const { PORT, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } =
  process.env;
const port = PORT || 3000;

const db = pgp(
  `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
);
app.use(bodyParser.json());

app.set('db', db);

app.use('/', controller);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
