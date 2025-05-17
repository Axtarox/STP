/**
 * Rutas para el panel de administración
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const dashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

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

// Gestión de categorías
router.get('/categorias', dashboardController.getCategorias);

// Gestión de servicios
router.get('/servicios', dashboardController.getServicios);

module.exports = router;