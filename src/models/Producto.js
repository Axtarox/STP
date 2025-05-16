
/**
 * Modelo de Producto optimizado para evitar bucles y logs excesivos
 */
const { pool } = require('../config/database');

class Producto {
    /**
     * Obtiene todos los productos activos con su categoría
     * @returns {Promise<Array>} Lista de productos
     */
    static async getAll() {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre 
                FROM producto p 
                LEFT JOIN categoria c ON p.categoria_id = c.id
                WHERE p.disponible = true
                ORDER BY p.id DESC
            `);
            
            return rows;
        } catch (error) {
            return [];
        }
    }

    /**
     * Obtiene un producto por su ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    static async getById(id) {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre 
                FROM producto p 
                LEFT JOIN categoria c ON p.categoria_id = c.id 
                WHERE p.id = ?
            `, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            const producto = rows[0];
            
            // Preprocesar características para mostrarlas correctamente
            if (producto.caracteristicas) {
                producto.caracteristicas = producto.caracteristicas.replace(/\\n/g, '\n');
            }
            
            // Asegurar que los campos sean del tipo correcto
            if (producto.precio !== undefined) {
                producto.precio = parseFloat(producto.precio);
            }
            
            if (producto.cantidad_disponible !== undefined) {
                producto.cantidad_disponible = parseInt(producto.cantidad_disponible, 10);
            }
            
            if (producto.disponible !== undefined) {
                producto.disponible = Boolean(parseInt(producto.disponible, 10));
            }
            
            return producto;
        } catch (error) {
            return null;
        }
    }

    /**
     * Obtiene productos por categoría
     * @param {number} categoriaId - ID de la categoría
     * @returns {Promise<Array>} Lista de productos
     */
    static async getByCategoria(categoriaId) {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre
                FROM producto p
                LEFT JOIN categoria c ON p.categoria_id = c.id
                WHERE p.categoria_id = ? AND p.disponible = true
                ORDER BY p.id DESC
            `, [categoriaId]);
            
            return rows;
        } catch (error) {
            return [];
        }
    }

    /**
     * Busca productos por términos
     * @param {string} query - Términos de búsqueda
     * @returns {Promise<Array>} Lista de productos
     */
    static async search(query) {
        try {
            // Preparar términos de búsqueda
            const searchTerm = `%${query}%`;
            
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre
                FROM producto p
                LEFT JOIN categoria c ON p.categoria_id = c.id
                WHERE (p.nombre LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ?)
                AND p.disponible = true
                ORDER BY p.id DESC
            `, [searchTerm, searchTerm, searchTerm]);
            
            return rows;
        } catch (error) {
            return [];
        }
    }

    /**
     * Obtiene productos destacados
     * @param {number} limit - Número máximo de productos a retornar
     * @returns {Promise<Array>} Lista de productos destacados
     */
    static async getFeatured(limit = 5) {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre 
                FROM producto p 
                LEFT JOIN categoria c ON p.categoria_id = c.id
                WHERE p.disponible = true 
                ORDER BY p.id DESC 
                LIMIT ?
            `, [limit]);
            
            return rows;
        } catch (error) {
            return [];
        }
    }

    /**
     * Obtiene productos aleatorios
     * @param {number} limit - Número máximo de productos a retornar
     * @returns {Promise<Array>} Lista de productos aleatorios
     */
    static async getRandom(limit = 5) {
        try {
            // Verificar rápidamente si hay productos
            const [countResult] = await pool.query(`
                SELECT COUNT(*) as total FROM producto WHERE disponible = true
            `);
            
            const totalProductos = countResult[0].total;
            
            if (totalProductos === 0) {
                return [];
            }
            
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre 
                FROM producto p 
                LEFT JOIN categoria c ON p.categoria_id = c.id
                WHERE p.disponible = true 
                ORDER BY RAND() 
                LIMIT ?
            `, [limit]);
            
            return rows;
        } catch (error) {
            return [];
        }
    }
}

module.exports = Producto;
