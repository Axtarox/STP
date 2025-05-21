/**
 * Rutas para el panel de administración (con orden corregido para categorías)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const dashboardController = require('../controllers/DashboardController');
const categoriaController = require('../controllers/CategoriaController');
const servicioController = require('../controllers/ServicioController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Middleware para manejar mensajes de sesión
router.use((req, res, next) => {
  // Pasar mensaje de éxito a la vista y luego eliminarlo de la sesión
  if (req.session.successMessage) {
    res.locals.success = req.session.successMessage;
    delete req.session.successMessage;
  }
  
  // Pasar mensaje de error a la vista y luego eliminarlo de la sesión
  if (req.session.error) {
    res.locals.error = req.session.error;
    delete req.session.error;
  }
  
  next();
});

// Rutas de autenticación
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Middleware para proteger rutas de administración
router.use(authMiddleware.isAdmin);

// Dashboard principal
router.get('/dashboard', dashboardController.getDashboard);
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// Gestión de productos
router.get('/productos', dashboardController.getProductos);
router.get('/productos/crear', dashboardController.getCrearProductoForm);
router.post('/productos/crear', upload.single('imagen'), dashboardController.crearProducto);
router.get('/productos/editar/:id', dashboardController.getEditarProductoForm);
router.post('/productos/editar/:id', upload.single('imagen'), dashboardController.editarProducto);
router.get('/productos/eliminar/:id', dashboardController.eliminarProducto);
router.get('/productos/:id', dashboardController.getProductoById);

// Gestión de categorías (ORDEN CORREGIDO)
router.get('/categorias', categoriaController.getAdminCategorias);
router.get('/categorias/crear', categoriaController.getCrearCategoriaForm);
router.post('/categorias/crear', categoriaController.crearCategoria);
router.get('/categorias/editar/:id', categoriaController.getEditarCategoriaForm);
router.post('/categorias/editar/:id', categoriaController.editarCategoria);
router.get('/categorias/eliminar/:id', categoriaController.eliminarCategoria);
router.get('/categorias/:id', categoriaController.getCategoriaById);

// Gestión de servicios (también con orden corregido)
router.get('/servicios', servicioController.getAdminServicios);
router.get('/servicios/crear', servicioController.getCrearServicioForm);
router.post('/servicios/crear', upload.single('imagen'), servicioController.crearServicio);
router.get('/servicios/editar/:id', servicioController.getEditarServicioForm);
router.post('/servicios/editar/:id', upload.single('imagen'), servicioController.editarServicio);
router.get('/servicios/eliminar/:id', servicioController.eliminarServicio);
router.get('/servicios/:id', servicioController.getAdminServicioById);

module.exports = router;