/**
 * Configuración de la base de datos
 * Adaptado para funcionar con WAMP Server
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// Obtener valores de configuración del entorno o usar valores predeterminados para WAMP
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  // WAMP suele usar contraseña vacía por defecto
  database: process.env.DB_NAME || 'pradito_tech',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} Resultado de la prueba
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
}

// Exportar el pool, la función de prueba y la configuración
module.exports = { pool, testConnection, dbConfig };