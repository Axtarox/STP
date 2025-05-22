const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/PedidoController');

// Mostrar confirmación de pedido
router.get('/confirmacion', pedidoController.getConfirmacion);

// API para crear un nuevo pedido
router.post('/crear', pedidoController.createPedido);

// API para generar mensaje de WhatsApp
router.post('/whatsapp', pedidoController.generateWhatsAppMessage);

module.exports = router;