/**
 * Modelo para la entidad Categoria
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
      throw error;
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
      throw error;
    }
  }

  /**
   * Crea una nueva categoría
   * @param {string} nombre - Nombre de la categoría
   * @returns {Promise<number>} ID de la categoría creada
   */
  static async create(nombre) {
    try {
      const [result] = await pool.query(`
        INSERT INTO categoria (nombre) 
        VALUES (?)
      `, [nombre]);
      return result.insertId;
    } catch (error) {
      console.error(`Error en Categoria.create("${nombre}"):`, error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente
   * @param {number} id - ID de la categoría
   * @param {string} nombre - Nuevo nombre de la categoría
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async update(id, nombre) {
    try {
      const [result] = await pool.query(`
        UPDATE categoria 
        SET nombre = ?
        WHERE id = ?
      `, [nombre, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error en Categoria.update(${id}, "${nombre}"):`, error);
      throw error;
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
      throw error;
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
      throw error;
    }
  }
}

module.exports = Categoria;