/**
 * Rutas para la página principal
 */

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/HomeController');

// Ruta para la página principal
router.get('/', homeController.getIndex);

module.exports = router;