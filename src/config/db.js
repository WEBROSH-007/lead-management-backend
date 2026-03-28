const { Sequelize } = require("sequelize");
const { Pool } = require("pg");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = { sequelize, pool };
