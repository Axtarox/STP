/**
 * Controlador para el manejo de pedidos completo
 */

/**
 * Muestra la página de confirmación de pedido
 */
exports.getConfirmacion = (req, res) => {
  try {
    res.render('pedidos/confirmacion', {
      titulo: 'Pedido Confirmado'
    });
  } catch (error) {
    console.error('Error al mostrar la confirmación:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al mostrar la página de confirmación',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Crea un nuevo pedido en la base de datos
 * Nota: Esta función está diseñada para ser llamada por API
 */
exports.createPedido = async (req, res) => {
  try {
    // Obtener datos del formulario
    const { 
      nombres, 
      apellidos,
      tipo_documento,
      num_documento,
      fecha_nacimiento,
      sexo = '',
      estado_civil = '',
      ciudad,
      direccion,
      telefono_fijo = '',
      telefono_movil,
      email, 
      metodoPago 
    } = req.body;
    
    // Validaciones básicas
    if (!nombres || !apellidos || !tipo_documento || !num_documento || 
        !fecha_nacimiento || !ciudad || !direccion || !telefono_movil || 
        !email || !metodoPago) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos marcados con * son obligatorios'
      });
    }
    
    // Verificar que haya productos en el carrito
    if (!req.session.cart || req.session.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay productos en el carrito'
      });
    }
    
    // En una implementación real, aquí se guardaría el pedido en la base de datos
    // Ejemplo pseudocódigo:
    /*
    const formularioId = await Formulario.create({
      nombres,
      apellidos,
      tipo_documento,
      num_documento,
      fecha_nacimiento,
      sexo,
      estado_civil,
      ciudad,
      direccion,
      telefono_fijo,
      telefono_movil,
      correo_electronico: email,
      opcion_pago: metodoPago
    });
    
    const carritoId = await Carrito.create({
      productos: req.session.cart,
      total: calcularTotal(req.session.cart)
    });
    
    const pedidoId = await Pedido.create({
      carrito_id: carritoId,
      formulario_id: formularioId,
      estado: 'pendiente',
      fecha: new Date()
    });
    */
    
    // Limpiar el carrito después de crear el pedido
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Pedido creado correctamente',
      redirect: '/pedidos/confirmacion'
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pedido. Por favor, intenta nuevamente.'
    });
  }
};

/**
 * Genera un mensaje de WhatsApp con la información del pedido
 */
exports.generateWhatsAppMessage = (req, res) => {
  try {
    // Obtener datos del formulario
    const { 
      nombres, 
      apellidos,
      tipo_documento,
      num_documento,
      fecha_nacimiento,
      sexo = '',
      estado_civil = '',
      ciudad,
      direccion,
      telefono_fijo = '',
      telefono_movil,
      email, 
      metodoPago,
      carrito
    } = req.body;
    
    // Validaciones básicas
    if (!nombres || !apellidos || !tipo_documento || !num_documento || 
        !fecha_nacimiento || !ciudad || !direccion || !telefono_movil || 
        !email || !metodoPago || !carrito) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    
    // Crear mensaje de WhatsApp
    let mensaje = `*Nuevo Pedido*%0A%0A`;
    mensaje += `*Nombres:* ${nombres}%0A`;
    mensaje += `*Apellidos:* ${apellidos}%0A`;
    mensaje += `*Documento:* ${tipo_documento} ${num_documento}%0A`;
    mensaje += `*Fecha Nacimiento:* ${fecha_nacimiento}%0A`;
    mensaje += `*Ciudad:* ${ciudad}%0A`;
    mensaje += `*Dirección:* ${direccion}%0A`;
    mensaje += `*Teléfono Móvil:* ${telefono_movil}%0A`;
    mensaje += `*Email:* ${email}%0A`;
    
    if (telefono_fijo) {
      mensaje += `*Teléfono Fijo:* ${telefono_fijo}%0A`;
    }
    
    if (sexo) {
      mensaje += `*Sexo:* ${sexo}%0A`;
    }
    
    if (estado_civil) {
      mensaje += `*Estado Civil:* ${estado_civil}%0A`;
    }
    
    mensaje += `*Método de Pago:* ${metodoPago}%0A%0A`;
    mensaje += `*Productos:*%0A`;
    
    let total = 0;
    
    // Agregar productos al mensaje
    carrito.items.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      mensaje += `- ${item.cantidad}x ${item.nombre} - $${subtotal.toLocaleString('es-CO')}%0A`;
    });
    
    mensaje += `%0A*Total:* $${total.toLocaleString('es-CO')}`;
    
    // Número de WhatsApp de la empresa (actualizado)
    const whatsappNumber = '573225865591';
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${mensaje}`;
    
    res.json({
      success: true,
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