/**
 * Controlador para el carrito de compras (CarritoController.js)
 */

/**
 * Obtiene la página del carrito de compras
 */
exports.getCarrito = (req, res) => {
  try {
    res.render('carrito', {
      titulo: 'Carrito de Compras'
    });
  } catch (error) {
    console.error('Error al cargar el carrito:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar la página del carrito',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Procesa el checkout
 */
exports.procesarCheckout = (req, res) => {
  try {
    // En una implementación real, aquí se procesaría el pedido y se guardaría en la base de datos
    
    // Para la versión actual, simplemente redirigimos a la página de confirmación
    res.redirect('/pedidos/confirmacion');
  } catch (error) {
    console.error('Error al procesar el checkout:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al procesar el checkout',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

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
 * Añade un producto al carrito (para APIs)
 */
exports.addToCart = (req, res) => {
  try {
    const { id, cantidad = 1 } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto requerido'
      });
    }
    
    // Inicializar carrito en la sesión si no existe
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Verificar si el producto ya está en el carrito
    const existingProduct = req.session.cart.find(item => item.id === id);
    
    if (existingProduct) {
      existingProduct.cantidad += cantidad;
    } else {
      // En una implementación real, se buscaría el producto en la base de datos
      // Para este ejemplo, simplemente añadimos el ID y la cantidad
      req.session.cart.push({ id, cantidad });
    }
    
    res.json({
      success: true,
      message: 'Producto añadido al carrito',
      cartCount: req.session.cart.length
    });
  } catch (error) {
    console.error('Error al añadir al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al añadir el producto al carrito'
    });
  }
};

/**
 * Elimina un producto del carrito (para APIs)
 */
exports.removeFromCart = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !req.session.cart) {
      return res.status(400).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }
    
    // Filtrar el carrito para eliminar el producto
    req.session.cart = req.session.cart.filter(item => item.id !== id);
    
    res.json({
      success: true,
      message: 'Producto eliminado del carrito',
      cartCount: req.session.cart.length
    });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto del carrito'
    });
  }
};

/**
 * Actualiza la cantidad de un producto en el carrito (para APIs)
 */
exports.updateCartItem = (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    
    if (!id || !req.session.cart || cantidad === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Producto no encontrado o cantidad no especificada'
      });
    }
    
    // Buscar el producto en el carrito
    const cartItem = req.session.cart.find(item => item.id === id);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }
    
    // Actualizar cantidad
    cartItem.cantidad = cantidad;
    
    // Si la cantidad es 0 o negativa, eliminar el producto
    if (cartItem.cantidad <= 0) {
      req.session.cart = req.session.cart.filter(item => item.id !== id);
    }
    
    res.json({
      success: true,
      message: 'Cantidad actualizada',
      cartCount: req.session.cart.length
    });
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la cantidad en el carrito'
    });
  }
};

/**
 * Obtiene el contenido del carrito (para APIs)
 */
exports.getCartContents = (req, res) => {
  try {
    // Si no hay carrito en la sesión, devolver un carrito vacío
    if (!req.session.cart) {
      return res.json({
        success: true,
        cart: {
          items: [],
          total: 0
        }
      });
    }
    
    // En una implementación real, aquí se buscarían los detalles de los productos
    // en la base de datos y se calcularía el total
    
    res.json({
      success: true,
      cart: {
        items: req.session.cart,
        total: req.session.cart.length // Aquí solo devolvemos la cantidad, no el total real
      }
    });
  } catch (error) {
    console.error('Error al obtener el contenido del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contenido del carrito'
    });
  }
};

/**
 * Vacía el carrito (para APIs)
 */
exports.clearCart = (req, res) => {
  try {
    // Vaciar el carrito
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Carrito vaciado correctamente'
    });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vaciar el carrito'
    });
  }
};