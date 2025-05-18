/**
 * Rutas actualizadas para categorías (corregidas)
 */

const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/CategoriaController');
const productoController = require('../controllers/ProductoController');

/**
 * Rutas públicas
 */

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        // Usar el modelo de Categoria para obtener los datos
        const Categoria = require('../models/Categoria');
        const categorias = await Categoria.getAll();
        
        res.render('categorias', {
            categorias,
            titulo: 'Categorías de Productos'
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar las categorías',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Ver detalle de una categoría
router.get('/:id/detalle', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de categoría inválido'
            });
        }
        
        // Obtener la categoría seleccionada
        const Categoria = require('../models/Categoria');
        const categoria = await Categoria.getById(id);
        
        if (!categoria) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Categoría no encontrada'
            });
        }
        
        res.render('categoria-detalle', {
            categoria,
            titulo: `Categoría: ${categoria.nombre}`
        });
    } catch (error) {
        console.error(`Error al obtener categoría ${req.params.id}:`, error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Ver productos de una categoría
router.get('/:id', productoController.getProductosByCategoria);

module.exports = router;