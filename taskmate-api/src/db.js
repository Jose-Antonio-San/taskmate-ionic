const mysql = require('mysql2/promise');

/** Puerto del servidor MySQL (3306 por defecto). No confundir con PORT de Express en .env */
const DB_PORT = Number(process.env.DB_PORT) || 3306;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: DB_PORT,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'taskmate',
    waitForConnections: true,
    connectionLimit: 10,
  });
}

module.exports = createPool();
