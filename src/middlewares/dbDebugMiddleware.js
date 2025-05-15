/**
 * Middleware para debugging de base de datos
 * - Este middleware intercepta y registra todas las consultas SQL
 */
const util = require('util');

function dbDebugMiddleware(req, res, next) {
    // Solo activar en entorno de desarrollo
    if (process.env.NODE_ENV !== 'production') {
        // Obtener el pool de conexiones
        const { pool } = require('../config/database');
        
        // Guardar la función query original
        const originalQuery = pool.query;
        
        // Reemplazar con una versión que registra las consultas
        pool.query = function(...args) {
            const sql = args[0];
            const params = args.length > 1 ? args[1] : [];
            
            console.log('🔍 Ejecutando consulta SQL:');
            console.log(`  ${sql}`);
            if (params.length > 0) {
                console.log('  Parámetros:', util.inspect(params, { colors: true, depth: null }));
            }
            
            // Ejecutar la consulta original
            const result = originalQuery.apply(this, args);
            
            // Para fines de depuración, podríamos registrar también los resultados
            result.then(data => {
                const rows = data[0];
                console.log(`✅ Consulta completada, devolvió ${rows.length} filas`);
            }).catch(err => {
                console.error('❌ Error en consulta SQL:', err);
            });
            
            return result;
        };
    }
    
    next();
}

module.exports = dbDebugMiddleware;