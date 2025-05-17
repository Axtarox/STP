/**
 * Rutas para el panel de administración actualizadas
 * - Usa el middleware de carga de archivos
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const dashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Middleware para manejar mensajes de sesión
router.use((req, res, next) => {
  // Pasar mensaje de éxito a la vista y luego eliminarlo de la sesión
  if (req.session.successMessage) {
    res.locals.success = req.session.successMessage;
    delete req.session.successMessage;
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
router.get('/productos/:id', dashboardController.getProductoById);
router.get('/productos/editar/:id', dashboardController.getEditarProductoForm);
router.post('/productos/editar/:id', upload.single('imagen'), dashboardController.editarProducto);
router.get('/productos/eliminar/:id', dashboardController.eliminarProducto);

// Gestión de categorías
router.get('/categorias', dashboardController.getCategorias);

// Gestión de servicios
router.get('/servicios', dashboardController.getServicios);

module.exports = router;