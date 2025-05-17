/**
 * Modelo de Producto optimizado con todas las operaciones CRUD
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
                ORDER BY p.id DESC
            `);
            
            return rows;
        } catch (error) {
            console.error('Error en Producto.getAll:', error);
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
            console.error(`Error en Producto.search("${query}"):`, error);
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
     * @param {Object} producto - Datos del producto a crear
     * @returns {Promise<number|null>} ID del producto creado o null en caso de error
     */
    static async create(producto) {
        try {
            const {
                nombre,
                categoria_id,
                precio,
                descripcion,
                caracteristicas,
                imagen,
                condicion = 'Nuevo',
                cantidad_disponible = 0,
                disponible = true
            } = producto;
            
            const [result] = await pool.query(`
                INSERT INTO producto (
                    categoria_id, 
                    nombre, 
                    descripcion, 
                    caracteristicas, 
                    precio, 
                    imagen, 
                    condicion, 
                    cantidad_disponible,
                    disponible
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                categoria_id,
                nombre,
                descripcion,
                caracteristicas,
                precio,
                imagen,
                condicion,
                cantidad_disponible,
                disponible ? 1 : 0
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Error en Producto.create:', error);
            return null;
        }
    }

    /**
     * Actualiza un producto existente
     * @param {number} id - ID del producto a actualizar
     * @param {Object} producto - Datos actualizados del producto
     * @returns {Promise<boolean>} true si se actualizó correctamente, false en caso contrario
     */
    static async update(id, producto) {
        try {
            const {
                nombre,
                categoria_id,
                precio,
                descripcion,
                caracteristicas,
                imagen,
                condicion,
                cantidad_disponible,
                disponible
            } = producto;
            
            const [result] = await pool.query(`
                UPDATE producto SET
                    categoria_id = ?,
                    nombre = ?,
                    descripcion = ?,
                    caracteristicas = ?,
                    precio = ?,
                    imagen = ?,
                    condicion = ?,
                    cantidad_disponible = ?,
                    disponible = ?
                WHERE id = ?
            `, [
                categoria_id,
                nombre,
                descripcion,
                caracteristicas,
                precio,
                imagen,
                condicion,
                cantidad_disponible,
                disponible ? 1 : 0,
                id
            ]);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error en Producto.update(${id}):`, error);
            return false;
        }
    }

    /**
     * Elimina un producto
     * @param {number} id - ID del producto a eliminar
     * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
     */
    static async delete(id) {
        try {
            const [result] = await pool.query(`
                DELETE FROM producto
                WHERE id = ?
            `, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error en Producto.delete(${id}):`, error);
            return false;
        }
    }
}

module.exports = Producto;