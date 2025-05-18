/**
 * Modelo mejorado para la entidad Categoria
 */

const { pool } = require('../config/database');

class Categoria {
  /**
   * Obtiene todas las categorías
   * @returns {Promise<Array>} Lista de categorías
   */
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM categoria
        ORDER BY nombre ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error en Categoria.getAll:', error);
      return [];
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object|null>} Categoría encontrada o null
   */
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM categoria 
        WHERE id = ?
      `, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Error en Categoria.getById(${id}):`, error);
      return null;
    }
  }

  /**
   * Crea una nueva categoría
   * @param {string} nombre - Nombre de la categoría
   * @param {string} descripcion - Descripción de la categoría
   * @returns {Promise<number|null>} ID de la categoría creada o null en caso de error
   */
  static async create(nombre, descripcion = '') {
    try {
      const [result] = await pool.query(`
        INSERT INTO categoria (nombre, descripcion) 
        VALUES (?, ?)
      `, [nombre, descripcion]);
      return result.insertId;
    } catch (error) {
      console.error(`Error en Categoria.create("${nombre}"):`, error);
      return null;
    }
  }

  /**
   * Actualiza una categoría existente
   * @param {number} id - ID de la categoría
   * @param {string} nombre - Nuevo nombre de la categoría
   * @param {string} descripcion - Nueva descripción de la categoría
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async update(id, nombre, descripcion = '') {
    try {
      const [result] = await pool.query(`
        UPDATE categoria 
        SET nombre = ?, descripcion = ?
        WHERE id = ?
      `, [nombre, descripcion, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error en Categoria.update(${id}, "${nombre}"):`, error);
      return false;
    }
  }

  /**
   * Elimina una categoría
   * @param {number} id - ID de la categoría
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(`
        DELETE FROM categoria 
        WHERE id = ?
      `, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error en Categoria.delete(${id}):`, error);
      return false;
    }
  }

  /**
   * Verifica si una categoría tiene productos asociados
   * @param {number} id - ID de la categoría
   * @returns {Promise<boolean>} True si tiene productos, false en caso contrario
   */
  static async hasProducts(id) {
    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM producto 
        WHERE categoria_id = ?
      `, [id]);
      return rows[0].count > 0;
    } catch (error) {
      console.error(`Error en Categoria.hasProducts(${id}):`, error);
      return false;
    }
  }
  
  /**
   * Obtiene el total de categorías en la base de datos
   * @returns {Promise<number>} Total de categorías
   */
  static async getCount() {
    try {
      const [result] = await pool.query(`
        SELECT COUNT(*) as total 
        FROM categoria
      `);
      return result[0].total;
    } catch (error) {
      console.error('Error en Categoria.getCount:', error);
      return 0;
    }
  }
}

module.exports = Categoria;