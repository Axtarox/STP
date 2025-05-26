const express = require('express');
const router = express.Router();
const productoController = require('../controllers/ProductoController');
const authMiddleware = require('../middlewares/authMiddleware');

 
// Obtener todos los productos
router.get('/', productoController.getAllProductos);

// Búsqueda de productos
router.get('/buscar', productoController.searchProductos);

// Obtener productos destacados
router.get('/destacados', productoController.getProductosDestacados);

// Obtener productos por categoría
router.get('/categoria/:id', productoController.getProductosByCategoria);

// Obtener un producto por ID (Esta ruta debe ir al final para evitar conflictos)
router.get('/:id', productoController.getProductoById);



module.exports = router;