/**
 * Rutas para contacto
 */

const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/ContactoController');

// Procesar formulario de contacto
router.post('/enviar', contactoController.submitContactForm);

// API para enviar mensaje a WhatsApp
router.post('/whatsapp', contactoController.sendWhatsAppMessage);

module.exports = router;