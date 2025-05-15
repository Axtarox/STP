/**
 * Funciones auxiliares para el formateo de datos
 */

/**
 * Formatea un número como precio con separadores de miles
 * @param {number|string} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(precio) {
    // Asegurarse de que es un número
    const numericPrice = parseFloat(precio) || 0;
    // Formatear con separadores de miles
    return numericPrice.toLocaleString('es-CO');
}

module.exports = {
    formatPrice
};
