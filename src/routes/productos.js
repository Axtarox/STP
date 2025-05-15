/**
 * Rutas mejoradas para productos
 */

const express = require('express');
const router = express.Router();
const productoController = require('../controllers/ProductoController');
// Importamos el middleware de autenticación
const authMiddleware = require('../middlewares/authMiddleware');

// Comentamos temporalmente la importación del middleware de upload hasta su implementación
// const upload = require('../middlewares/uploadMiddleware');

/**
 * Rutas públicas
 */
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

/**
 * Rutas de administración (protegidas)
 * NOTA: Estas rutas están comentadas hasta que se implemente el módulo de administración
 */
// Middleware para proteger rutas administrativas
// router.use('/admin', authMiddleware.isAdmin);

// Rutas admin para productos
/*
router.get('/admin', productoController.adminGetAllProductos);
router.post('/admin/crear', upload.single('imagen'), productoController.createProducto);
router.post('/admin/actualizar/:id', upload.single('imagen'), productoController.updateProducto);
router.get('/admin/eliminar/:id', productoController.deleteProducto);
*/

module.exports = router;