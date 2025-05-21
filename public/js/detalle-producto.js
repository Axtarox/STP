/**
 * Funcionalidad específica para la página de detalle de producto
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar selector de cantidad
    initQuantitySelector();
    
    // Botón de añadir al carrito
    const addToCartBtn = document.getElementById('btnAddToCart');
    
    if (addToCartBtn) {
        // Remover cualquier event listener previo (para evitar duplicados)
        addToCartBtn.removeEventListener('click', handleAddToCart);
        
        // Añadir el nuevo event listener
        addToCartBtn.addEventListener('click', handleAddToCart);
    }
});

/**
 * Manejador para el evento click del botón añadir al carrito
 */
function handleAddToCart() {
    const productId = this.getAttribute('data-id');
    const productName = this.getAttribute('data-nombre');
    const productPrice = this.getAttribute('data-precio');
    const productImg = this.getAttribute('data-imagen');
    
    // Obtener la cantidad seleccionada
    const quantityInput = document.getElementById('product-quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // Crear el objeto de producto
    const producto = {
        id: productId,
        nombre: productName,
        precio: parseFloat(productPrice.replace(/\./g, '').replace(/,/g, '.')) || 0,
        imagen: productImg,
        cantidad: quantity
    };
    
    // Añadir al carrito (una sola vez)
    addProductToCart(producto);
    
    // Mostrar confirmación con el toast mejorado
    showToast(productName + ' ha sido añadido al carrito');
    
    // Animar el botón flotante del carrito
    animateCartIcon();
}

/**
 * Inicializa el selector de cantidad
 */
function initQuantitySelector() {
    const quantityMinus = document.getElementById('quantity-minus');
    const quantityPlus = document.getElementById('quantity-plus');
    const quantityInput = document.getElementById('product-quantity');
    
    if (!quantityMinus || !quantityPlus || !quantityInput) return;
    
    // Eliminar eventos existentes para evitar duplicados
    quantityMinus.removeEventListener('click', decrementQuantity);
    quantityPlus.removeEventListener('click', incrementQuantity);
    
    // Agregar nuevos event listeners
    quantityMinus.addEventListener('click', decrementQuantity);
    quantityPlus.addEventListener('click', incrementQuantity);
    
    // Validar entrada directa
    quantityInput.addEventListener('change', validateQuantityInput);
}

/**
 * Función para decrementar la cantidad
 */
function decrementQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    let value = parseInt(quantityInput.value);
    if (value > 1) {
        quantityInput.value = value - 1;
    }
}

/**
 * Función para incrementar la cantidad
 */
function incrementQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    let value = parseInt(quantityInput.value);
    const max = parseInt(quantityInput.getAttribute('max'));
    if (value < max) {
        quantityInput.value = value + 1;
    }
}

/**
 * Función para validar la entrada directa
 */
function validateQuantityInput() {
    let value = parseInt(this.value);
    const max = parseInt(this.getAttribute('max'));
    
    if (isNaN(value) || value < 1) {
        this.value = 1;
    } else if (value > max) {
        this.value = max;
    }
}

/**
 * Muestra una notificación tipo toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error)
 */
function showToast(mensaje, tipo = 'success') {
    // Buscar si ya existe un toast
    let toast = document.querySelector('.toast');
    
    // Si no existe, crear uno nuevo
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Añadir clases según el tipo
    toast.className = 'toast';
    if (tipo === 'success') {
        toast.classList.add('toast-success');
    } else if (tipo === 'error') {
        toast.classList.add('toast-error');
    }
    
    // Añadir icono según el tipo
    let icono = tipo === 'success' ? 
        '<i class="fas fa-check-circle"></i>' : 
        '<i class="fas fa-exclamation-circle"></i>';
    
    // Establecer el contenido
    toast.innerHTML = `${icono} <span>${mensaje}</span>`;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Anima el icono del carrito con rebote
 */
function animateCartIcon() {
    // Buscar el carrito flotante por su ID
    const floatingCart = document.getElementById('floating-cart');
    
    if (floatingCart) {
        // Añadir clase de animación
        floatingCart.classList.add('cart-bounce');
        
        // Quitar la clase después de que termine la animación
        setTimeout(function() {
            floatingCart.classList.remove('cart-bounce');
        }, 750);
    }
}

/**
 * Añade un producto al carrito
 * Se asegura de que solo se añada una vez evitando duplicados
 */
function addProductToCart(producto) {
    // Obtener carrito actual del localStorage
    let carrito;
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [], total: 0 };
    } catch (e) {
        carrito = { items: [], total: 0 };
        console.error('Error al parsear carrito:', e);
    }
    
    // Verificar si el producto ya existe
    // Convert IDs to strings for consistent comparison
    const index = carrito.items.findIndex(item => String(item.id) === String(producto.id));
    
    if (index !== -1) {
        // Incrementar cantidad
        carrito.items[index].cantidad += producto.cantidad;
    } else {
        // Añadir nuevo producto
        carrito.items.push(producto);
    }
    
    // Calcular total
    carrito.total = carrito.items.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
    
    // Guardar carrito
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar contador
    updateCartCount();
}
/**
 * Actualiza el contador del carrito
 */
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [] };
        
        // Calcular número total de ítems (sumando las cantidades)
        const totalItems = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        // Actualizar número
        cartCount.textContent = totalItems;
        
        // Mostrar contador si hay elementos
        if (carrito.items.length > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    } catch (e) {
        cartCount.textContent = '0';
    }
}