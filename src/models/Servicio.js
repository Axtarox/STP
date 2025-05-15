/**
 * Modelo para la entidad Servicio
 */
const { pool } = require('../config/database');

class Servicio {
  /**
   * Obtiene todos los servicios
   * @param {number} limit - Límite opcional de servicios a retornar
   * @returns {Promise<Array>} Lista de servicios
   */
  static async getAll(limit = null) {
    try {
      let query = `
        SELECT * FROM servicio
        WHERE disponible = true
        ORDER BY id DESC
      `;
      
      if (limit) {
        query += ' LIMIT ?';
        const [rows] = await pool.query(query, [limit]);
        return rows;
      } else {
        const [rows] = await pool.query(query);
        return rows;
      }
    } catch (error) {
      console.error('Error en Servicio.getAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene un servicio por su ID
   * @param {number} id - ID del servicio
   * @returns {Promise<Object|null>} Servicio encontrado o null
   */
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM servicio 
        WHERE id = ?
      `, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Error en Servicio.getById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Obtiene servicios destacados (todos los servicios disponibles hasta el límite especificado)
   * @param {number} limit - Número máximo de servicios a retornar
   * @returns {Promise<Array>} Lista de servicios destacados
   */
  static async getFeatured(limit = 5) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM servicio 
        WHERE disponible = true 
        ORDER BY id DESC 
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error(`Error en Servicio.getFeatured(${limit}):`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo servicio
   * @param {Object} servicio - Datos del servicio
   * @returns {Promise<number>} ID del servicio creado
   */
  static async create(servicio) {
    try {
      const [result] = await pool.query(`
        INSERT INTO servicio 
        (imagen, nombre, descripcion, disponible) 
        VALUES (?, ?, ?, ?)
      `, [
        servicio.imagen,
        servicio.nombre,
        servicio.descripcion,
        servicio.disponible
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error en Servicio.create:', error);
      throw error;
    }
  }

  /**
   * Actualiza un servicio existente
   * @param {number} id - ID del servicio
   * @param {Object} servicio - Datos del servicio
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async update(id, servicio) {
    try {
      const [result] = await pool.query(`
        UPDATE servicio SET 
        imagen = IFNULL(?, imagen), 
        nombre = ?, 
        descripcion = ?, 
        disponible = ? 
        WHERE id = ?
      `, [
        servicio.imagen,
        servicio.nombre,
        servicio.descripcion,
        servicio.disponible,
        id
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error en Servicio.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Elimina un servicio
   * @param {number} id - ID del servicio
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(`
        DELETE FROM servicio 
        WHERE id = ?
      `, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error en Servicio.delete(${id}):`, error);
      throw error;
    }
  }
}

module.exports = Servicio;