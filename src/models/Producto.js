/**
 * Modelo mejorado para la entidad Producto
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
            console.error("Error en Producto.getAll:", error);
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
        console.log(`Buscando producto con ID: ${id}`);
        
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM producto p 
            LEFT JOIN categoria c ON p.categoria_id = c.id 
            WHERE p.id = ?
        `, [id]);
        
        console.log(`Resultado de la consulta:`, rows.length > 0 ? 'Producto encontrado' : 'Producto no encontrado');
        
        if (rows.length === 0) {
            return null;
        }
        
        const producto = rows[0];
        
        // Preprocesar características para mostrarlas correctamente
        if (producto.caracteristicas) {
            console.log('Características antes de procesamiento:', producto.caracteristicas);
            producto.caracteristicas = producto.caracteristicas.replace(/\\n/g, '\n');
            console.log('Características después de procesamiento:', producto.caracteristicas);
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
        
        console.log('Producto procesado completo:', producto);
        
        return producto;
    } catch (error) {
        console.error(`Error en Producto.getById(${id}):`, error);
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
            console.error(`Error en Producto.getByCategoria(${categoriaId}):`, error);
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
            console.error(`Error en Producto.search(${query}):`, error);
            return [];
        }
    }

    /**
     * Obtiene productos relacionados (misma categoría, excluyendo el actual)
     * @param {number} productoId - ID del producto actual
     * @param {number} categoriaId - ID de la categoría
     * @param {number} limit - Número máximo de productos a retornar
     * @returns {Promise<Array>} Lista de productos relacionados
     */
    static async getRelacionados(productoId, categoriaId, limit = 4) {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, c.nombre as categoria_nombre
                FROM producto p
                LEFT JOIN categoria c ON p.categoria_id = c.id
                WHERE p.categoria_id = ? AND p.id != ? AND p.disponible = true
                ORDER BY RAND()
                LIMIT ?
            `, [categoriaId, productoId, limit]);
            
            return rows;
        } catch (error) {
            console.error(`Error en Producto.getRelacionados(${productoId}, ${categoriaId}):`, error);
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
            // Primero verificar si hay productos disponibles
            const [countResult] = await pool.query(`
                SELECT COUNT(*) as total FROM producto WHERE disponible = true
            `);
            
            const totalProductos = countResult[0].total;
            
            // Si no hay productos disponibles, devolver array vacío
            if (totalProductos === 0) {
                console.log('No hay productos disponibles en la base de datos');
                return [];
            }
            
            // Obtener productos aleatorios
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
            console.error(`Error en Producto.getRandom(${limit}):`, error);
            // En caso de error, devolver un array vacío en lugar de lanzar una excepción
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
            console.error(`Error en Producto.getFeatured(${limit}):`, error);
            return [];
        }
    }

    /**
     * Crea un nuevo producto
     * @param {Object} producto - Datos del producto
     * @returns {Promise<number>} ID del producto creado
     */
    static async create(producto) {
        try {
            const [result] = await pool.query(`
                INSERT INTO producto (
                    categoria_id, 
                    imagen, 
                    nombre, 
                    condicion, 
                    descripcion, 
                    caracteristicas, 
                    precio, 
                    cantidad_disponible, 
                    disponible
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                producto.categoria_id,
                producto.imagen,
                producto.nombre,
                producto.condicion,
                producto.descripcion,
                producto.caracteristicas,
                producto.precio,
                producto.cantidad_disponible,
                producto.disponible
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Error en Producto.create:', error);
            throw error;
        }
    }

    /**
     * Actualiza un producto existente
     * @param {number} id - ID del producto
     * @param {Object} producto - Datos del producto
     * @returns {Promise<boolean>} Resultado de la operación
     */
    static async update(id, producto) {
        try {
            const [result] = await pool.query(`
                UPDATE producto SET
                    categoria_id = ?, 
                    imagen = IFNULL(?, imagen), 
                    nombre = ?, 
                    condicion = ?, 
                    descripcion = ?, 
                    caracteristicas = ?, 
                    precio = ?, 
                    cantidad_disponible = ?, 
                    disponible = ?
                WHERE id = ?
            `, [
                producto.categoria_id,
                producto.imagen,
                producto.nombre,
                producto.condicion,
                producto.descripcion,
                producto.caracteristicas,
                producto.precio,
                producto.cantidad_disponible,
                producto.disponible,
                id
            ]);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error en Producto.update(${id}):`, error);
            throw error;
        }
    }

    /**
     * Elimina un producto
     * @param {number} id - ID del producto
     * @returns {Promise<boolean>} Resultado de la operación
     */
    static async delete(id) {
        try {
            const [result] = await pool.query(`
                DELETE FROM producto WHERE id = ?
            `, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error en Producto.delete(${id}):`, error);
            throw error;
        }
    }

    /**
     * Actualiza la disponibilidad de un producto
     * @param {number} id - ID del producto
     * @param {boolean} disponible - Nuevo estado de disponibilidad
     * @returns {Promise<boolean>} Resultado de la operación
     */
    static async updateDisponibilidad(id, disponible) {
        try {
            const [result] = await pool.query(`
                UPDATE producto SET disponible = ? WHERE id = ?
            `, [disponible, id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error en Producto.updateDisponibilidad(${id}, ${disponible}):`, error);
            throw error;
        }
    }
}

module.exports = Producto;