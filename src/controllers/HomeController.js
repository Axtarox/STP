/**
 * Controlador principal optimizado 
 */
const Producto = require('../models/Producto');
const Servicio = require('../models/Servicio');

/**
 * Página principal con productos aleatorios 
 */
exports.getIndex = async (req, res) => {
  try {
    // Obtener 5 productos aleatorios DISPONIBLES sin logs excesivos
    let productos = [];
    try {
      // Usar getRandom que ya filtra por disponibles
      productos = await Producto.getRandom(5);
      
      // Si no hay productos, usar un array vacío
      if (!productos || productos.length === 0) {
        productos = [];
      }
    } catch (error) {
      console.error('Error al obtener productos aleatorios:', error);
      productos = [];
    }
    
    // Obtener 5 servicios destacados DISPONIBLES sin logs excesivos
    let servicios = [];
    try {
      // Usar getFeatured que ya filtra por disponibles
      servicios = await Servicio.getFeatured(5);
      
      // Si no hay servicios, usar un array vacío
      if (!servicios || servicios.length === 0) {
        servicios = [];
      }
    } catch (error) {
      console.error('Error al obtener servicios destacados:', error);
      servicios = [];
    }

    // Formatear precios de productos - FORMAT AS INTEGERS by using Math.round
    productos = productos.map(producto => ({
      ...producto,
      precio: Math.round(parseFloat(producto.precio || 0))
             .toLocaleString('es-CO') // Format according to Colombian locale
    }));
    
    // Renderizar la vista con los datos obtenidos
    res.render('index', {
      titulo: 'Inicio - Soluciones Tecnológicas Pradito',
      productos,
      servicios
    });
  } catch (error) {
    console.error('Error al cargar la página principal:', error);
    // Manejar error general
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar la página principal',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};