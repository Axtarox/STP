/**
 * Controlador principal (homeController.js)
 */
const Producto = require('../models/Producto');
const Servicio = require('../models/Servicio');

/**
 * Página principal con productos aleatorios y servicios destacados
 */
exports.getIndex = async (req, res) => {
  try {
    // Obtener 5 productos aleatorios de la base de datos
    let productos = [];
    try {
      console.log('Intentando obtener productos aleatorios...');
      productos = await Producto.getRandom(5);
      console.log(`Productos obtenidos: ${productos.length}`);
      
      if (productos.length === 0) {
        console.log('No se encontraron productos aleatorios, obteniendo los más recientes...');
        productos = await Producto.getFeatured(5);
        console.log(`Productos destacados obtenidos: ${productos.length}`);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      productos = [];
    }
    
    // Obtener 5 servicios de la base de datos
    let servicios = [];
    try {
      console.log('Intentando obtener servicios destacados...');
      servicios = await Servicio.getFeatured(5);
      console.log(`Servicios obtenidos: ${servicios.length}`);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      servicios = [];
    }

    // Formatear precios de productos para mostrar con comas
    productos = productos.map(producto => ({
      ...producto,
      precio: producto.precio ? producto.precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
    }));
    
    console.log('Datos para renderizar:');
    console.log(`- Productos: ${productos.length}`);
    console.log(`- Servicios: ${servicios.length}`);
    
    // Renderizar la vista con los datos obtenidos
    res.render('index', {
      titulo: 'Inicio - Soluciones Tecnológicas Pradito',
      productos,
      servicios
    });
  } catch (error) {
    console.error('Error al cargar la página principal:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar la página principal',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};