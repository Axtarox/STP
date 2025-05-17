/**
 * Controlador actualizado para el dashboard de administración
 * - Con soporte para renderizado standalone (sin header/footer)
 */
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Servicio = require('../models/Servicio');

/**
 * Muestra el dashboard principal
 */
exports.getDashboard = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const numProductos = (await Producto.getAll()).length;
    const numCategorias = (await Categoria.getAll()).length;
    const numServicios = (await Servicio.getAll()).length;
    
    // Renderizar dashboard en modo standalone
    res.render('admin/dashboard', {
      titulo: 'Dashboard - Panel de Administración',
      admin: req.session.adminData,
      stats: {
        productos: numProductos,
        categorias: numCategorias,
        servicios: numServicios
      },
      current_page: { dashboard: true },
      standalone: true // Esta opción evita usar el layout principal
    });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar el dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Gestión de productos
 */
exports.getProductos = async (req, res) => {
  try {
    // Obtener todos los productos
    const productos = await Producto.getAll();
    
    // Obtener categorías para el formulario
    const categorias = await Categoria.getAll();
    
    res.render('admin/productos', {
      titulo: 'Gestión de Productos',
      admin: req.session.adminData,
      productos,
      categorias,
      current_page: { productos: true },
      standalone: true // Esta opción evita usar el layout principal
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar los productos',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Gestión de categorías
 */
exports.getCategorias = async (req, res) => {
  try {
    // Obtener todas las categorías
    const categorias = await Categoria.getAll();
    
    res.render('admin/categorias', {
      titulo: 'Gestión de Categorías',
      admin: req.session.adminData,
      categorias,
      current_page: { categorias: true },
      standalone: true // Esta opción evita usar el layout principal
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar las categorías',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Gestión de servicios
 */
exports.getServicios = async (req, res) => {
  try {
    // Obtener todos los servicios
    const servicios = await Servicio.getAll();
    
    res.render('admin/servicios', {
      titulo: 'Gestión de Servicios',
      admin: req.session.adminData,
      servicios,
      current_page: { servicios: true },
      standalone: true // Esta opción evita usar el layout principal
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar los servicios',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};