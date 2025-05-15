/**
 * Rutas para la gestión de servicios
 */

const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/ServicioController');
// Importamos el middleware de autenticación
const authMiddleware = require('../middlewares/authMiddleware');

// Comentamos temporalmente la importación del middleware de upload hasta su implementación
// const upload = require('../middlewares/uploadMiddleware');

/**
 * Rutas públicas
 */

// Obtener todos los servicios
router.get('/', servicioController.getAllServicios);

// Obtener servicios destacados (para la página principal)
router.get('/destacados', servicioController.getServiciosDestacados);

// Ver detalle de un servicio
router.get('/:id', servicioController.getServicioById);

/**
 * Rutas de administración (protegidas)
 * NOTA: Estas rutas están comentadas hasta que se implemente el módulo de administración
 */

// Middleware para proteger rutas administrativas
// router.use('/admin', authMiddleware.isAdmin);

// Rutas admin para servicios
/*
router.get('/admin', servicioController.adminGetAllServicios);
router.post('/admin/crear', upload.single('imagen'), servicioController.createServicio);
router.post('/admin/actualizar/:id', upload.single('imagen'), servicioController.updateServicio);
router.get('/admin/eliminar/:id', servicioController.deleteServicio);
*/

module.exports = router;