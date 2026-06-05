const mysql = require('mysql2/promise');
const { DB } = require('./env');

const pool = mysql.createPool({
  ...DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
