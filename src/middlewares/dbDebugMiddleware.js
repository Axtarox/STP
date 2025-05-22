
const util = require('util');

function dbDebugMiddleware(req, res, next) {
    // Solo activar en entorno de desarrollo y si DEBUG está habilitado
    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_SQL === 'true') {
        // Obtener el pool de conexiones
        const { pool } = require('../config/database');
        
        // Guardar la función query original
        const originalQuery = pool.query;
        
        // Reemplazar con una versión que registra las consultas
        pool.query = function(...args) {
            const sql = args[0];
            
            // Ejecutar la consulta original sin logging adicional
            const result = originalQuery.apply(this, args);
            
            return result;
        };
    }
    
    next();
}

module.exports = dbDebugMiddleware;
