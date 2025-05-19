/**
 * Controlador para el manejo de formularios de contacto
 */

/**
 * Procesa el envío del formulario de contacto
 */
exports.submitContactForm = async (req, res) => {
  try {
    // Obtener datos del formulario
    const { 
      nombre, 
      email, 
      telefono = '', 
      asunto, 
      mensaje 
    } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !asunto || !mensaje) {
      return res.render('contacto', {
        titulo: 'Contáctanos',
        error: 'Todos los campos marcados con * son obligatorios',
        formData: req.body // Devolver los datos para no perderlos
      });
    }
    
    // Validar email con una expresión regular simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('contacto', {
        titulo: 'Contáctanos',
        error: 'Por favor, ingresa un correo electrónico válido',
        formData: req.body
      });
    }
    
    // En una implementación real, aquí se guardaría el mensaje en la base de datos
    // Ejemplo pseudocódigo:
    /*
    await Contacto.create({
      nombres: nombre.split(' ')[0],
      apellidos: nombre.split(' ').slice(1).join(' '),
      telefono_movil: telefono,
      correo_electronico: email,
      mensaje,
      asunto,
      fecha_contacto: new Date()
    });
    */
    
    // También se podría enviar un correo electrónico de notificación
    // usando un servicio como Nodemailer
    
    // Renderizar la página de contacto con mensaje de éxito
    res.render('contacto', {
      titulo: 'Contáctanos',
      success: '¡Gracias por contactarnos! Te responderemos lo antes posible.'
    });
  } catch (error) {
    console.error('Error al enviar formulario de contacto:', error);
    res.status(500).render('contacto', {
      titulo: 'Contáctanos',
      error: 'Error al enviar el formulario. Por favor, intenta nuevamente.',
      formData: req.body
    });
  }
};

/**
 * Envía un mensaje al WhatsApp de la empresa (para APIs)
 */
exports.sendWhatsAppMessage = (req, res) => {
  try {
    // Obtener datos del formulario
    const { 
      nombre, 
      email, 
      telefono = '', 
      asunto, 
      mensaje 
    } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos marcados con * son obligatorios'
      });
    }
    
    // Validar email con una expresión regular simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, ingresa un correo electrónico válido'
      });
    }
    
    // Crear mensaje de WhatsApp
    let whatsappMessage = `*Nuevo Mensaje de Contacto*%0A%0A`;
    whatsappMessage += `*Nombre:* ${nombre}%0A`;
    whatsappMessage += `*Email:* ${email}%0A`;
    
    if (telefono) {
      whatsappMessage += `*Teléfono:* ${telefono}%0A`;
    }
    
    whatsappMessage += `*Asunto:* ${asunto}%0A%0A`;
    whatsappMessage += `*Mensaje:*%0A${mensaje}`;
    
    // Número de WhatsApp de la empresa (cambiar por el real)
    const whatsappNumber = '573225865591';
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    res.json({
      success: true,
      message: 'Mensaje generado correctamente',
      whatsappUrl
    });
  } catch (error) {
    console.error('Error al generar mensaje de WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el mensaje de WhatsApp'
    });
  }
};