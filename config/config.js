require("dotenv").config();
const env = process.env;

const development = {
  username: "user",
  password: "1234",
  database: "kdt8",
  host: "127.0.0.1",
  dialect: "mysql",
};
const test = {
  username: "root",
  password: null,
  database: "database_test",
  host: "127.0.0.1",
  dialect: "mysql",
};

const production = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PW,
  database: env.MYSQL_MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: "mysql",
};

module.exports = { development, production, test };
