const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/CarritoController');

// Mostrar el carrito
router.get('/', carritoController.getCarrito);

// API para añadir producto al carrito
router.post('/add', carritoController.addToCart);

// API para eliminar producto del carrito
router.delete('/remove/:id', carritoController.removeFromCart);

// API para actualizar cantidad de un producto
router.put('/update/:id', carritoController.updateCartItem);

// API para obtener el contenido del carrito
router.get('/api/contents', carritoController.getCartContents);

// API para vaciar el carrito
router.delete('/api/clear', carritoController.clearCart);

// Procesar el checkout
router.post('/checkout', carritoController.procesarCheckout);

module.exports = router;