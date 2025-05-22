const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/ServicioController');
const authMiddleware = require('../middlewares/authMiddleware');


// Obtener todos los servicios
router.get('/', servicioController.getAllServicios);

// Obtener servicios destacados (para la página principal)
router.get('/destacados', servicioController.getServiciosDestacados);

// Ver detalle de un servicio
router.get('/:id', servicioController.getServicioById);



module.exports = router;