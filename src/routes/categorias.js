/**
 * Rutas para la gestión de categorías
 */

const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/CategoriaController');
const productoController = require('../controllers/ProductoController');
// Importamos el middleware de autenticación
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Rutas públicas
 */

// Obtener todas las categorías
router.get('/', categoriaController.getAllCategorias);

// Ver detalle de una categoría
router.get('/:id/detalle', categoriaController.getCategoriaById);

// Ver productos de una categoría
router.get('/:id', productoController.getProductosByCategoria);

/**
 * Rutas de administración (protegidas)
 * NOTA: Estas rutas están comentadas hasta que se implemente el módulo de administración
 */

// Middleware para proteger rutas administrativas
// router.use('/admin', authMiddleware.isAdmin);

// Rutas de administración para categorías
/*
router.get('/admin', authMiddleware.isAdmin, categoriaController.adminGetAllCategorias);
router.post('/admin/crear', authMiddleware.isAdmin, categoriaController.createCategoria);
router.post('/admin/actualizar/:id', authMiddleware.isAdmin, categoriaController.updateCategoria);
router.get('/admin/eliminar/:id', authMiddleware.isAdmin, categoriaController.deleteCategoria);
*/

module.exports = router;